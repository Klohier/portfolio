import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface Author {
  name?: string;
  photo?: string;
  url?: string;
}

/**
 * A single webmention entry in JF2 format.
 * The `url` field is the source URL of the mention (used for deduplication).
 */
interface Mention {
  "wm-property": "like-of" | "repost-of" | "in-reply-to" | "mention-of";
  author?: Author;
  url: string;
  published?: string | null;
  content?: { text?: string };
}

/**
 * `<wm-mentions>` — a Lit web component that fetches and displays webmentions for a given page.
 *
 * Fetches mentions from any JF2-compatible webmention endpoint. Automatically queries
 * both the `www.` and bare domain variants of the target URL in parallel, then deduplicates
 * results by source URL so the same mention is never shown twice.
 *
 * @example
 * ```html
 * <wm-mentions
 *   post-url="https://example.com/blog/my-post"
 *   endpoint="https://webmention.io/example.com/webmention"
 *   fetch-endpoint="https://webmention.io/api/mentions.jf2"
 * ></wm-mentions>
 * ```
 *
 * @slot like-icon - Icon shown before the like count. Defaults to `♥`. Accepts any HTML — emoji, SVG, icon font element.
 * @slot repost-icon - Icon shown before the repost count. Defaults to `↩`. Accepts any HTML — emoji, SVG, icon font element.
 *
 * @attr {string} post-url - The canonical URL of the page to fetch mentions for.
 *   Also used as the hidden `target` field in the send form.
 * @attr {string} endpoint - The POST endpoint for submitting new webmentions
 *   (e.g. `https://webmention.io/example.com/webmention`).
 * @attr {string} fetch-endpoint - The GET endpoint used to fetch existing mentions.
 *   Must return JF2 format (`{ children: Mention[] }`).
 *   Defaults to `https://webmention.io/api/mentions.jf2`.
 *
 * ## CSS Custom Properties
 * All properties are prefixed with `--wm-` and have sensible defaults, so the component
 * renders correctly with no configuration.
 *
 * @cssvar --wm-accent-color - Links and button background. Default: `#3b82f6`.
 * @cssvar --wm-text-color - Body text. Default: `inherit`.
 * @cssvar --wm-border-color - Top separator border. Default: `#cbd5e1`.
 * @cssvar --wm-reply-bg - Reply card background. Default: `#f8fafc`.
 * @cssvar --wm-reply-border-color - Reply card border. Default: `#cbd5e1`.
 * @cssvar --wm-input-bg - URL input background. Default: `#f8fafc`.
 * @cssvar --wm-input-border-color - URL input border. Default: `#cbd5e1`.
 * @cssvar --wm-avatar-bg - Placeholder avatar background. Default: `#cbd5e1`.
 * @cssvar --wm-button-text-color - Send button text. Default: `#fff`.
 *
 * ## CSS Parts
 * For full structural control, target parts with `wm-mentions::part(name)`.
 *
 * @csspart base - The root `<section>` element.
 * @csspart heading - The `<h2>` heading.
 * @csspart send-form - Container `<div>` wrapping the send form.
 * @csspart input - The URL `<input>` in the send form.
 * @csspart button - The send `<button>`.
 * @csspart list - Container `<div>` wrapping the mentions list.
 * @csspart reactions - Container `<div>` for like/repost counts.
 * @csspart stat - Individual `<span>` for a like or repost count.
 * @csspart replies - The `<ol>` list of reply/mention items.
 * @csspart reply - An individual reply `<li>`.
 * @csspart reply-meta - The meta row inside a reply (avatar, author, date, link).
 * @csspart avatar - The author avatar `<img>` or placeholder `<span>`.
 * @csspart reply-author - The author name `<span>`.
 * @csspart reply-date - The published `<time>` element.
 * @csspart reply-link - The source link `→` anchor.
 * @csspart reply-content - The reply text `<p>`.
 * @csspart status - Status messages (loading, empty state).
 */
@customElement("wm-mentions")
export class WmMentions extends LitElement {
  /** The canonical URL of the page whose mentions should be fetched and displayed. */
  @property({ type: String, attribute: "post-url" }) postUrl = "";

  /** POST endpoint for submitting new webmentions (the form action). */
  @property({ type: String, attribute: "endpoint" }) endpoint = "";

  /**
   * GET endpoint for fetching existing mentions.
   * Must accept a `target` query param and return JF2 (`{ children: [...] }`).
   * Defaults to the webmention.io API.
   */
  @property({ type: String, attribute: "fetch-endpoint" }) fetchEndpoint = "https://webmention.io/api/mentions.jf2";

  @state() private mentions: Mention[] = [];
  @state() private loading = true;
  @state() private error = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.postUrl) this.fetchMentions();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("postUrl") && this.postUrl) {
      this.fetchMentions();
    }
  }

  /**
   * Fetches mentions for both the www and non-www variants of `postUrl` in parallel,
   * then merges and deduplicates the results by source URL.
   *
   * Two requests are made so the component stays compatible with any JF2 endpoint,
   * regardless of whether it supports multi-target query params.
   */
  private async fetchMentions() {
    this.loading = true;
    this.error = false;

    try {
      /** Ensures the URL ends with a trailing slash, as required by most webmention endpoints. */
      const normalize = (u: string) => (u.endsWith("/") ? u : `${u}/`);
      const url = normalize(this.postUrl);
      const parsed = new URL(url);

      // Derive the alternate domain variant (www ↔ bare).
      const isWww = parsed.hostname.startsWith("www.");
      const altHostname = isWww ? parsed.hostname.slice(4) : `www.${parsed.hostname}`;
      const altUrl = normalize(`${parsed.protocol}//${altHostname}${parsed.pathname}${parsed.search}`);

      /** Fetches mentions for a single target URL from the configured endpoint. */
      const fetchTarget = async (target: string) => {
        const res = await fetch(
          `${this.fetchEndpoint}?target=${encodeURIComponent(target)}&per-page=100`
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        return (data.children ?? []) as Mention[];
      };

      const [primary, alt] = await Promise.all([fetchTarget(url), fetchTarget(altUrl)]);
      const all = [...primary, ...alt];

      // Deduplicate by source URL — the same mention may appear under both target variants.
      const seen = new Set<string>();
      this.mentions = all.filter((m) => {
        if (seen.has(m.url)) return false;
        seen.add(m.url);
        return true;
      });
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private get likes() {
    return this.mentions.filter((m) => m["wm-property"] === "like-of");
  }

  private get reposts() {
    return this.mentions.filter((m) => m["wm-property"] === "repost-of");
  }

  private get replies() {
    return this.mentions.filter(
      (m) => m["wm-property"] === "in-reply-to" || m["wm-property"] === "mention-of"
    );
  }

  private renderReply(m: Mention) {
    const author = m.author ?? {};
    const date = m.published
      ? new Date(m.published).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

    return html`
      <li class="reply" part="reply">
        <div class="reply-meta" part="reply-meta">
          ${author.photo
            ? html`<img src=${author.photo} alt=${author.name ?? ""} class="avatar" part="avatar" width="28" height="28" />`
            : html`<span class="avatar placeholder" part="avatar"></span>`}
          <span class="reply-author" part="reply-author">
            ${author.url
              ? html`<a href=${author.url} rel="noopener noreferrer">${author.name ?? author.url}</a>`
              : (author.name ?? "Anonymous")}
          </span>
          ${date ? html`<time class="reply-date" part="reply-date">${date}</time>` : nothing}
          <a href=${m.url} class="reply-link" part="reply-link" rel="noopener noreferrer">→</a>
        </div>
        ${m.content?.text ? html`<p class="reply-content" part="reply-content">${m.content.text}</p>` : nothing}
      </li>
    `;
  }

  render() {
    return html`
      <section part="base">
        <h2 part="heading">Webmentions</h2>

        <div class="send" part="send-form">
          <p>Written a response? Send a webmention:</p>
          <form action=${this.endpoint} method="post">
            <input type="hidden" name="target" .value=${this.postUrl} />
            <input type="url" name="source" placeholder="https://your-post-url.com" required part="input" />
            <button type="submit" part="button">Send</button>
          </form>
        </div>

        <div class="list" part="list">
          ${this.loading
            ? html`<p class="status" part="status">Loading mentions…</p>`
            : this.error
            ? nothing
            : this.mentions.length === 0
            ? html`<p class="status" part="status">No mentions yet.</p>`
            : html`
                ${this.likes.length > 0 || this.reposts.length > 0
                  ? html`
                      <div class="reactions" part="reactions">
                        ${this.likes.length > 0
                          ? html`<span class="stat" part="stat"><slot name="like-icon">♥</slot> ${this.likes.length} like${this.likes.length !== 1 ? "s" : ""}</span>`
                          : nothing}
                        ${this.reposts.length > 0
                          ? html`<span class="stat" part="stat"><slot name="repost-icon">↩</slot> ${this.reposts.length} repost${this.reposts.length !== 1 ? "s" : ""}</span>`
                          : nothing}
                      </div>
                    `
                  : nothing}
                ${this.replies.length > 0
                  ? html`<ol class="replies" part="replies">${this.replies.map((m) => this.renderReply(m))}</ol>`
                  : nothing}
              `}
        </div>
      </section>
    `;
  }

  static styles = css`
    :host {
      --wm-text-color: inherit;
      --wm-accent-color: #2563eb;
      --wm-border-color: #6b7280;
      --wm-reply-bg: transparent;
      --wm-reply-border-color: #d1d5db;
      --wm-input-bg: #ffffff;
      --wm-input-border-color: #9ca3af;
      --wm-avatar-bg: #9ca3af;
      --wm-button-text-color: #ffffff;

      display: block;
      color: var(--wm-text-color);
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--wm-border-color);
    }

    h2 {
      margin: 0 0 1.5rem;
    }

    .send p {
      font-size: 0.9rem;
      opacity: 0.75;
      margin: 0 0 0.5rem;
    }

    form {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    input[type="url"] {
      flex: 1;
      min-width: 0;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--wm-input-border-color);
      border-radius: 6px;
      background: var(--wm-input-bg);
      color: var(--wm-text-color);
      font-size: 0.9rem;
      font-family: inherit;
    }

    button {
      padding: 0.4rem 1rem;
      border-radius: 6px;
      border: none;
      background: var(--wm-accent-color);
      color: var(--wm-button-text-color);
      font-size: 0.9rem;
      font-family: inherit;
      cursor: pointer;
    }

    .status {
      font-size: 0.9rem;
      opacity: 0.6;
    }

    .reactions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .replies {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .reply {
      background: var(--wm-reply-bg);
      border: 1px solid var(--wm-reply-border-color);
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }

    .reply-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.4rem;
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .avatar.placeholder {
      display: inline-block;
      background: var(--wm-avatar-bg);
    }

    .reply-author {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .reply-author a {
      color: var(--wm-accent-color);
      text-decoration: none;
    }

    .reply-date {
      font-size: 0.8rem;
      opacity: 0.6;
      margin-left: auto;
    }

    .reply-link {
      font-size: 0.85rem;
      color: var(--wm-accent-color);
      text-decoration: none;
    }

    .reply-content {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.85;
      line-height: 1.5;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wm-mentions": WmMentions;
  }
}
