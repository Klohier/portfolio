import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("vinyl-record")
export class VinylRecord extends LitElement {
  @property({ type: String }) src = "";
  @property({ type: String }) title = "";
  @property({ type: String }) artist = "";
  @property({ type: Boolean, reflect: true }) spinning = false;
  @property({ type: Number }) speed = 2;
  @property({ type: Number }) size = 200;
  @property({ type: String, attribute: "label-color" }) labelColor = "#c0392b";
  @property({ type: String, attribute: "groove-color" }) grooveColor = "#1a1a1a";

  static styles = css`
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .vinyl {
      border-radius: 50%;
      background-image: repeating-radial-gradient(
        circle at center,
        transparent 0px,
        transparent 3px,
        rgba(255, 255, 255, 0.03) 3px,
        rgba(255, 255, 255, 0.03) 4px
      );
      box-shadow:
        0 0 0 2px rgba(255, 255, 255, 0.08),
        0 4px 24px rgba(0, 0, 0, 0.6);
      animation: spin linear infinite;
      animation-play-state: paused;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    :host([spinning]) .vinyl {
      animation-play-state: running;
    }

    .label {
      width: 38%;
      height: 38%;
      border-radius: 50%;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cover {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    .label::after {
      content: "";
      position: absolute;
      width: 12%;
      height: 12%;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .caption {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .caption-title {
      font-family: sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: inherit;
      text-align: center;
      line-height: 1.2;
    }

    .caption-artist {
      font-family: sans-serif;
      font-size: 12px;
      color: inherit;
      opacity: 0.65;
      text-align: center;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  render() {
    const vinylStyles = styleMap({
      width: `var(--vinyl-size, ${this.size}px)`,
      height: `var(--vinyl-size, ${this.size}px)`,
      backgroundColor: this.grooveColor,
      animationDuration: `${this.speed}s`,
    });

    const spindleStyles = styleMap({
      backgroundColor: this.grooveColor,
    });

    return html`
      <div class="vinyl" style=${vinylStyles}>
        <div class="label">
          ${this.src
            ? html`<img class="cover" src=${this.src} alt=${this.title} />`
            : html`<div class="cover" style="background:${this.labelColor}"></div>`}
          <div class="spindle" style=${spindleStyles}></div>
        </div>
      </div>

      ${this.title || this.artist
        ? html`
            <div class="caption">
              ${this.title ? html`<span class="caption-title">${this.title}</span>` : ""}
              ${this.artist ? html`<span class="caption-artist">${this.artist}</span>` : ""}
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vinyl-record": VinylRecord;
  }
}
