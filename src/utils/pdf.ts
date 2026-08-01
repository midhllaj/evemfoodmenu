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

const renderDish = (dish: SelectedDish) => `<li>
  <span>${escapeHtml(dish.name)}</span>
  ${dish.quantity ? `<small>Qty: ${escapeHtml(dish.quantity)}</small>` : ""}
  ${dish.remarks ? `<em>${escapeHtml(dish.remarks)}</em>` : ""}
</li>`;

const renderDishList = (dishes: SelectedDish[]) => {
  const sadyaDishes = dishes.filter((dish) => dish.category === "Kerala Sadya");
  const otherDishes = dishes.filter((dish) => dish.category !== "Kerala Sadya");

  return `
    ${
      sadyaDishes.length
        ? `<h3 class="menu-subheading">Kerala Sadya</h3><ul>${sadyaDishes.map(renderDish).join("")}</ul>`
        : ""
    }
    ${otherDishes.length ? `<ul>${otherDishes.map(renderDish).join("")}</ul>` : ""}
  `;
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
        ${renderDishList(dishes)}
      </section>`
    )
    .join("");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          box-sizing: border-box;
        }
        @page { 
          size: A4 portrait; 
          margin: 0;
        }
        html {
          margin: 0;
          padding: 0;
          background: #F9F7F0;
        }
        body {
          margin: 0;
          padding: 0;
          background: #F9F7F0;
          color: #073F35;
          font-family: Georgia, "Times New Roman", serif;
          width: 595px;
          min-height: 842px;
        }
        .proposal {
          width: 595px;
          min-height: 842px;
          border: 1px solid #D9C68D;
          padding: 28px;
          background: #FFFDF7;
          display: flex;
          flex-direction: column;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #073F35;
          padding-bottom: 12px;
          margin-bottom: 18px;
          gap: 12px;
        }
        .doc-title {
          margin: 0;
          font-size: 26px;
          font-style: italic;
          font-weight: 900;
          color: #073F35;
          letter-spacing: 1.5px;
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
          gap: 4px;
          flex-shrink: 0;
          min-width: 145px;
        }
        .brand-logo {
          width: 132px;
          height: 76px;
          display: block;
          object-fit: contain;
        }
        .company-name {
          margin: 0;
          font-size: 9px;
          font-weight: 900;
          color: #073F35;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          text-align: right;
        }
        .company-detail {
          margin: 0;
          font-size: 8px;
          color: #C9A227;
          font-weight: 600;
          text-align: right;
        }
        .title {
          margin: 20px 0 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }
        .title h2 {
          margin: 0;
          font-size: 20px;
          color: #073F35;
        }
        .title span {
          color: #D6A51E;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 14px;
          background: #F9F7F0;
          border-left: 5px solid #D6A51E;
          padding: 14px;
          margin-bottom: 18px;
        }
        .detail {
          min-width: 0;
        }
        .detail label {
          display: block;
          color: #6A7771;
          font-size: 8px;
          text-transform: uppercase;
          margin-bottom: 3px;
          font-weight: 700;
        }
        .detail strong {
          font-size: 11px;
          color: #073F35;
          word-wrap: break-word;
          display: block;
        }
        .menu-section {
          margin: 14px 0;
          flex: 0 0 auto;
          break-inside: auto;
          page-break-inside: auto;
        }
        .menu-section h2 {
          margin: 0 0 8px;
          padding-bottom: 5px;
          border-bottom: 1px solid #D9C68D;
          color: #073F35;
          font-size: 15px;
          font-weight: 700;
          break-after: avoid;
          page-break-after: avoid;
        }
        .menu-subheading {
          margin: 0 0 7px;
          color: #073F35;
          font-size: 10px;
          font-weight: 700;
          break-after: avoid;
          page-break-after: avoid;
        }
        .menu-section ul + ul {
          margin-top: 10px;
        }
        ul {
          margin: 0;
          padding: 0;
          columns: 1;
          column-gap: 0;
        }
        li {
          display: inline-block;
          width: 100%;
          list-style: none;
          margin: 0 0 6px;
          font-size: 11px;
          line-height: 1.5;
          break-inside: avoid;
          page-break-inside: avoid;
          -webkit-column-break-inside: avoid;
        }
        li::before {
          content: "•";
          color: #D6A51E;
          font-size: 14px;
          margin-right: 6px;
          vertical-align: -1px;
        }
        small {
          color: #6A7771;
          margin-left: 6px;
          font-size: 8px;
        }
        em {
          display: block;
          margin-left: 18px;
          color: #6A7771;
          font-size: 8px;
          margin-top: 2px;
        }
        footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #D9C68D;
          padding-bottom: 10px;
          color: #6A7771;
          font-size: 8px;
          text-align: center;
          line-height: 1.5;
        }
        @media print {
          body {
            padding: 0;
            width: 595px;
          }
          .proposal {
            max-width: none;
            width: 595px;
            min-height: 842px;
          }
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

export async function generatePdfBytes(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
): Promise<{ uri?: string; fileName: string; base64Data?: string }> {
  const html = buildQuotationHtml(customer, headings, selected);
  const fileName = makeFileName(customer);
  
  if (Platform.OS === "web") {
    // For web, create a standalone HTML document with A4 sizing
    const blob = new Blob([html], { type: "text/html" });
    const uri = URL.createObjectURL(blob);
    return { uri, fileName };
  } else {
    // For mobile, use expo-print
    const { uri } = await Print.printToFileAsync({ html });
    return { uri, fileName };
  }
}
