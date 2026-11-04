import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, 'cache');

/**
 * Stealth HTTP Client for discreet, human-like web scraping
 * Features:
 * - Real Chrome / Windows fingerprint headers
 * - Automatic cookie jar persistence
 * - Human-like jitter delays between requests
 * - Local filesystem caching (zero duplicate network calls)
 * - Safe exponential retry on rate-limiting
 */
export class StealthClient {
  constructor(options = {}) {
    this.minDelayMs = options.minDelayMs ?? 1200;
    this.maxDelayMs = options.maxDelayMs ?? 2800;
    this.cacheTtlHours = options.cacheTtlHours ?? 24;
    this.useCache = options.useCache !== false;
    this.cookies = new Map();
    this.lastRequestTime = 0;
    this.userAgent = options.userAgent || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  }

  async init() {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    // Pre-seed consent cookie so the site doesn't redirect or show consent banners
    this.cookies.set('ta_consent', 'yes');
  }

  _getCacheKey(url) {
    return crypto.createHash('sha256').update(url).digest('hex') + '.html';
  }

  async _readCache(url) {
    if (!this.useCache) return null;
    try {
      const cacheFile = path.join(CACHE_DIR, this._getCacheKey(url));
      const stats = await fs.stat(cacheFile);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      if (ageHours < this.cacheTtlHours) {
        return await fs.readFile(cacheFile, 'utf-8');
      }
    } catch {
      // Cache miss or read error
    }
    return null;
  }

  async _writeCache(url, content) {
    try {
      const cacheFile = path.join(CACHE_DIR, this._getCacheKey(url));
      await fs.writeFile(cacheFile, content, 'utf-8');
    } catch (err) {
      console.warn(`[Cache Warning] Could not write cache for ${url}:`, err.message);
    }
  }

  _getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  _saveCookies(response) {
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    for (const cookieStr of setCookieHeaders) {
      const parts = cookieStr.split(';')[0].split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        this.cookies.set(name, value);
      }
    }
  }

  async _waitJitter() {
    const elapsed = Date.now() - this.lastRequestTime;
    const targetDelay = Math.floor(
      Math.random() * (this.maxDelayMs - this.minDelayMs) + this.minDelayMs
    );
    const waitTime = Math.max(0, targetDelay - elapsed);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetches a URL with browser-like headers and jitter
   */
  async fetchPage(url, retries = 3) {
    // 1. Check local cache first
    const cached = await this._readCache(url);
    if (cached) {
      return { html: cached, fromCache: true, status: 200 };
    }

    // 2. Wait human-like delay
    await this._waitJitter();

    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    const cookieHeader = this._getCookieHeader();
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    try {
      const res = await fetch(url, {
        headers,
        redirect: 'follow',
      });

      this._saveCookies(res);

      if (res.status === 429 || res.status === 503) {
        if (retries > 0) {
          const backoff = 5000 + Math.random() * 3000;
          console.warn(`[StealthClient] Rate-limit ${res.status} on ${url}. Backing off ${Math.round(backoff)}ms...`);
          await new Promise((r) => setTimeout(r, backoff));
          return this.fetchPage(url, retries - 1);
        }
      }

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const html = await res.text();
      await this._writeCache(url, html);
      return { html, fromCache: false, status: res.status };
    } catch (err) {
      if (retries > 0) {
        console.warn(`[StealthClient] Fetch error on ${url}: ${err.message}. Retrying...`);
        await new Promise((r) => setTimeout(r, 3000));
        return this.fetchPage(url, retries - 1);
      }
      throw err;
    }
  }
}
