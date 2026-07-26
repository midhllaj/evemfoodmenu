import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { CustomerDetails, Heading, SelectedDish } from "../types";
import { LOGO_BASE64 } from "./logo";

const escapeHtml = (value: string | undefined) =>
  (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const makeFileName = (customer: CustomerDetails) => {
  const base = customer.customerName || customer.eventName || "evam-quotation";
  return `${base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "evam-quotation"}.pdf`;
};

const wrapWords = (text: string, maxChars: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
};

export function buildQuotationHtml(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
) {
  const grouped = headings
    .filter((heading) => heading.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((heading) => ({
      heading,
      dishes: selected.filter((dish) => dish.headingId === heading.id)
    }))
    .filter((group) => group.dishes.length > 0);

  const sections = grouped
    .map(
      ({ heading, dishes }) => `
      <section class="menu-section">
        <h2>${escapeHtml(heading.name)}</h2>
        <ul>
          ${dishes
            .map(
              (dish) => `<li>
                <span>${escapeHtml(dish.name)}</span>
                ${dish.quantity ? `<small>Qty: ${escapeHtml(dish.quantity)}</small>` : ""}
                ${dish.remarks ? `<em>${escapeHtml(dish.remarks)}</em>` : ""}
              </li>`
            )
            .join("")}
        </ul>
      </section>`
    )
    .join("");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: A4; margin: 34px; }
        body {
          margin: 0;
          background: #F9F7F0;
          color: #073F35;
          font-family: Georgia, "Times New Roman", serif;
        }
        .proposal {
          min-height: 1030px;
          border: 1px solid #D9C68D;
          padding: 34px;
          background: #FFFDF7;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 3px solid #073F35;
          padding-bottom: 16px;
          margin-bottom: 22px;
        }
        .doc-title {
          margin: 0;
          font-size: 34px;
          font-style: italic;
          font-weight: 900;
          color: #073F35;
          letter-spacing: 2px;
          padding-bottom: 4px;
          border-bottom: 3px solid #073F35;
          position: relative;
          display: inline-block;
        }
        .doc-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 1.5px;
          background-color: #C9A227;
        }
        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .brand-logo {
          height: 72px;
          width: auto;
          display: block;
        }
        .company-name {
          margin: 0;
          font-size: 11px;
          font-weight: 900;
          color: #073F35;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .company-detail {
          margin: 0;
          font-size: 10px;
          color: #C9A227;
          font-weight: 600;
        }
        .title {
          margin: 30px 0 18px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title h2 {
          margin: 0;
          font-size: 24px;
          color: #073F35;
        }
        .title span {
          color: #D6A51E;
          font-size: 12px;
          text-transform: uppercase;
        }
        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 18px;
          background: #F9F7F0;
          border-left: 5px solid #D6A51E;
          padding: 18px;
          margin-bottom: 24px;
        }
        .detail label {
          display: block;
          color: #6A7771;
          font-size: 10px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .detail strong {
          font-size: 13px;
          color: #073F35;
        }
        .menu-section {
          break-inside: avoid;
          margin: 18px 0;
        }
        .menu-section h2 {
          margin: 0 0 8px;
          padding-bottom: 7px;
          border-bottom: 1px solid #D9C68D;
          color: #073F35;
          font-size: 18px;
        }
        ul {
          margin: 0;
          padding: 0;
          columns: 2;
          column-gap: 28px;
        }
        li {
          list-style: none;
          margin: 0 0 8px;
          font-size: 13px;
          line-height: 1.35;
          break-inside: avoid;
        }
        li::before {
          content: "•";
          color: #D6A51E;
          font-size: 18px;
          margin-right: 8px;
          vertical-align: -1px;
        }
        small {
          color: #6A7771;
          margin-left: 8px;
          font-size: 10px;
        }
        em {
          display: block;
          margin-left: 22px;
          color: #6A7771;
          font-size: 10px;
        }
        footer {
          margin-top: 30px;
          border-top: 1px solid #D9C68D;
          padding-top: 14px;
          color: #6A7771;
          font-size: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <main class="proposal">
        <header>
          <h1 class="doc-title">FOOD MENU</h1>
          <div class="header-right">
            <img src="${LOGO_BASE64}" alt="Evam Event Planners" class="brand-logo" />
            <p class="company-name">EVAM EVENT PLANNERS</p>
            <p class="company-detail">Guruvayur | 9946637535</p>
            <p class="company-detail">evam_event_planners | evameventplanners.in</p>
          </div>
        </header>
        <div class="title">
          <h2>${escapeHtml(customer.eventName || "Menu Quotation")}</h2>
          <span>${escapeHtml(customer.eventType || "Event Menu")}</span>
        </div>
        <section class="details">
          <div class="detail"><label>Customer</label><strong>${escapeHtml(customer.customerName)}</strong></div>
          <div class="detail"><label>Phone</label><strong>${escapeHtml(customer.phoneNumber)}</strong></div>
          <div class="detail"><label>Date</label><strong>${escapeHtml(customer.eventDate)}</strong></div>
          <div class="detail"><label>Guests</label><strong>${escapeHtml(customer.guests)}</strong></div>
          <div class="detail"><label>Venue</label><strong>${escapeHtml(customer.venue)}</strong></div>
          <div class="detail"><label>Notes</label><strong>${escapeHtml(customer.notes)}</strong></div>
        </section>
        ${sections}
        <footer>Prepared with care for your event. Final pricing may vary based on guest count, service style, and live counter requirements.</footer>
      </main>
    </body>
  </html>`;
}

export async function createAndSharePdf(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
) {
  const html = buildQuotationHtml(customer, headings, selected);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Evam catering quotation"
    });
  }
  return uri;
}

export async function downloadQuotationPdf(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
) {
  if (Platform.OS === "web") {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const fileName = makeFileName(customer);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const emerald = rgb(0.027, 0.247, 0.208);
    const gold = rgb(0.839, 0.647, 0.118);
    const muted = rgb(0.416, 0.467, 0.443);
    const ivory = rgb(0.976, 0.969, 0.941);
    const cream = rgb(1, 0.992, 0.969);
    const border = rgb(0.851, 0.776, 0.553);

    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: ivory });
    page.drawRectangle({ x: 34, y: 34, width: 527.28, height: 773.89, color: cream, borderColor: border, borderWidth: 1 });

    // Embed the logo image
    const logoDataUrl = LOGO_BASE64;
    const logoBase64 = logoDataUrl.replace(/^data:image\/png;base64,/, "");
    const logoBytes = Uint8Array.from(atob(logoBase64), (c) => c.charCodeAt(0));
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scaleToFit(130, 65);

    // ── Letterhead header ──────────────────────────────────────────
    const headerTop = 790;

    // Left: "FOOD MENU" large italic
    const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    page.drawText("FOOD MENU", { x: 58, y: headerTop - 30, size: 28, font: italic, color: emerald });
    // Underline beneath the title (thick green)
    page.drawLine({ start: { x: 58, y: headerTop - 38 }, end: { x: 235, y: headerTop - 38 }, thickness: 2, color: emerald });
    // Secondary thin line (gold)
    page.drawLine({ start: { x: 58, y: headerTop - 42 }, end: { x: 235, y: headerTop - 42 }, thickness: 1, color: gold });

    // Right: logo, then company details stacked
    const logoX = 537 - logoDims.width;
    page.drawImage(logoImage, { x: logoX, y: headerTop - logoDims.height + 10, width: logoDims.width, height: logoDims.height });

    // Company name bold green
    page.drawText("EVAM EVENT PLANNERS", { x: 537 - 140, y: headerTop - logoDims.height - 4, size: 8.5, font: bold, color: emerald });
    // Contact details in gold
    page.drawText("Guruvayur | 9946637535", { x: 537 - 120, y: headerTop - logoDims.height - 16, size: 8, font: regular, color: gold });
    page.drawText("evam_event_planners | evameventplanners.in", { x: 537 - 168, y: headerTop - logoDims.height - 27, size: 7.5, font: regular, color: gold });

    // Full-width divider
    let y = headerTop - logoDims.height - 38;
    page.drawLine({ start: { x: 58, y }, end: { x: 537, y }, thickness: 2, color: emerald });

    y -= 42;
    page.drawText(customer.eventName || "Menu Quotation", { x: 58, y, size: 20, font: bold, color: emerald });
    page.drawText(customer.eventType || "Event Menu", { x: 420, y: y + 3, size: 10, font: bold, color: gold });

    y -= 58;
    page.drawRectangle({ x: 58, y: y - 4, width: 479, height: 76, color: ivory });
    page.drawRectangle({ x: 58, y: y - 4, width: 5, height: 76, color: gold });
    const details = [
      ["Customer", customer.customerName || "-"],
      ["Phone", customer.phoneNumber || "-"],
      ["Date", customer.eventDate || "-"],
      ["Guests", customer.guests || "-"],
      ["Venue", customer.venue || "-"],
      ["Notes", customer.notes || "-"]
    ];
    details.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = col === 0 ? 78 : 310;
      const detailY = y + 50 - row * 22;
      page.drawText(`${label}:`, { x, y: detailY, size: 9, font: bold, color: muted });
      page.drawText(value, { x: x + 48, y: detailY, size: 10, font: bold, color: emerald });
    });

    y -= 44;
    const grouped = headings
      .filter((heading) => heading.visible)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((heading) => ({
        heading,
        dishes: selected.filter((dish) => dish.headingId === heading.id)
      }))
      .filter((group) => group.dishes.length > 0);

    if (!grouped.length) {
      page.drawText("Selected menu items will appear here.", { x: 58, y, size: 12, font: regular, color: muted });
    }

    grouped.forEach(({ heading, dishes }) => {
      if (y < 90) return;
      page.drawText(heading.name, { x: 58, y, size: 15, font: bold, color: emerald });
      y -= 8;
      page.drawLine({ start: { x: 58, y }, end: { x: 537, y }, thickness: 0.8, color: border });
      y -= 17;

      dishes.forEach((dish) => {
        if (y < 70) return;
        const detail = [dish.name, dish.quantity ? `Qty: ${dish.quantity}` : "", dish.remarks ? `Remarks: ${dish.remarks}` : ""]
          .filter(Boolean)
          .join("  ");
        wrapWords(detail, 74).forEach((line, lineIndex) => {
          page.drawText(lineIndex === 0 ? `- ${line}` : `  ${line}`, {
            x: 70,
            y,
            size: 11,
            font: regular,
            color: emerald
          });
          y -= 14;
        });
      });
      y -= 8;
    });

    page.drawLine({ start: { x: 58, y: 72 }, end: { x: 537, y: 72 }, thickness: 0.8, color: border });
    page.drawText("Prepared with care for your event. Final pricing may vary based on guest count, service style, and live counter requirements.", {
      x: 58,
      y: 55,
      size: 8,
      font: regular,
      color: muted
    });

    const bytes = await pdfDoc.save();
    const pdfBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(pdfBuffer).set(bytes);
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return fileName;
  }

  const html = buildQuotationHtml(customer, headings, selected);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
