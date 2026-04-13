import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface Author {
  name?: string;
  photo?: string;
  url?: string;
}

interface Mention {
  "wm-property": "like-of" | "repost-of" | "in-reply-to" | "mention-of";
  author?: Author;
  url: string;
  published?: string | null;
  content?: { text?: string };
}

@customElement("wm-mentions")
export class WmMentions extends LitElement {
  @property({ type: String, attribute: "post-url" }) postUrl = "";

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

  private async fetchMentions() {
    this.loading = true;
    this.error = false;

    try {
      const url = this.postUrl.endsWith("/") ? this.postUrl : `${this.postUrl}/`;
      const res = await fetch(
        `https://webmention.io/api/mentions.jf2?target=${url}&per-page=50`
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      this.mentions = data.children ?? [];
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
      <li class="reply">
        <div class="reply-meta">
          ${author.photo
            ? html`<img src=${author.photo} alt=${author.name ?? ""} class="avatar" width="28" height="28" />`
            : html`<span class="avatar placeholder"></span>`}
          <span class="reply-author">
            ${author.url
              ? html`<a href=${author.url} rel="noopener noreferrer">${author.name ?? author.url}</a>`
              : (author.name ?? "Anonymous")}
          </span>
          ${date ? html`<time class="reply-date">${date}</time>` : nothing}
          <a href=${m.url} class="reply-link" rel="noopener noreferrer">→</a>
        </div>
        ${m.content?.text ? html`<p class="reply-content">${m.content.text}</p>` : nothing}
      </li>
    `;
  }

  render() {
    return html`
      <section>
        <h2>Webmentions</h2>

        <div class="send">
          <p>Written a response? Send a webmention:</p>
          <form action="https://webmention.io/keijilohier.com/webmention" method="post">
            <input type="hidden" name="target" .value=${this.postUrl} />
            <input type="url" name="source" placeholder="https://your-post-url.com" required />
            <button type="submit">Send</button>
          </form>
        </div>

        <div class="list">
          ${this.loading
            ? html`<p class="status">Loading mentions…</p>`
            : this.error
            ? nothing
            : this.mentions.length === 0
            ? html`<p class="status">No mentions yet.</p>`
            : html`
                ${this.likes.length > 0 || this.reposts.length > 0
                  ? html`
                      <div class="reactions">
                        ${this.likes.length > 0
                          ? html`<span class="stat">♥ ${this.likes.length} like${this.likes.length !== 1 ? "s" : ""}</span>`
                          : nothing}
                        ${this.reposts.length > 0
                          ? html`<span class="stat">↩ ${this.reposts.length} repost${this.reposts.length !== 1 ? "s" : ""}</span>`
                          : nothing}
                      </div>
                    `
                  : nothing}
                ${this.replies.length > 0
                  ? html`<ol class="replies">${this.replies.map((m) => this.renderReply(m))}</ol>`
                  : nothing}
              `}
        </div>
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--blue-7);
    }

    h2 {
      margin: 0 0 1.5rem;
      color: var(--text-color, inherit);
    }

    .send p {
      font-size: 0.9rem;
      opacity: 0.75;
      margin: 0 0 0.5rem;
      color: var(--text-color, inherit);
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
      border: 1px solid var(--blue-6);
      border-radius: 6px;
      background: var(--blue-2);
      color: var(--text-color, inherit);
      font-size: 0.9rem;
      font-family: inherit;
    }

    button {
      padding: 0.4rem 1rem;
      border-radius: 6px;
      border: none;
      background: var(--primary-color);
      color: var(--text-color, inherit);
      font-size: 0.9rem;
      font-family: inherit;
      cursor: pointer;
    }

    .status {
      font-size: 0.9rem;
      opacity: 0.6;
      color: var(--text-color, inherit);
    }

    .reactions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      font-size: 0.9rem;
      opacity: 0.8;
      color: var(--text-color, inherit);
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
      background: var(--blue-2);
      border: 1px solid var(--blue-6);
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
      background: var(--blue-6);
    }

    .reply-author {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-color, inherit);
    }

    .reply-author a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .reply-date {
      font-size: 0.8rem;
      opacity: 0.6;
      margin-left: auto;
      color: var(--text-color, inherit);
    }

    .reply-link {
      font-size: 0.85rem;
      color: var(--primary-color);
      text-decoration: none;
    }

    .reply-content {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.85;
      line-height: 1.5;
      color: var(--text-color, inherit);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wm-mentions": WmMentions;
  }
}
