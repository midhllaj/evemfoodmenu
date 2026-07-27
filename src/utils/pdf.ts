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

export async function generatePdfBytes(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
): Promise<{ uri?: string; fileName: string; base64Data?: string }> {
  const html = buildQuotationHtml(customer, headings, selected);
  const fileName = makeFileName(customer);
  
  if (Platform.OS === "web") {
    // For web, create a blob URL from the HTML
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Evam Catering Quotation</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Georgia, serif;">
          ${html}
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlWithStyles], { type: "text/html" });
    const uri = URL.createObjectURL(blob);
    return { uri, fileName };
  } else {
    // For mobile, use expo-print
    const { uri } = await Print.printToFileAsync({ html });
    return { uri, fileName };
  }
}

export async function createAndSharePdf(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
) {
  const { bytes, fileName, base64Data } = await generatePdfBytes(customer, headings, selected);

  if (Platform.OS === "web") {
    const pdfBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(pdfBuffer).set(bytes);
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const file = new File([blob], fileName, { type: "application/pdf" });

    // On web, attempt to open the native OS share sheet with WhatsApp, Email, etc.
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Evam Catering Quotation",
          text: "Please find attached the catering menu quotation for your event."
        });
        return fileName;
      } catch (err) {
        // User cancelled - this is expected behavior, not an error
        if ((err as Error).name === "AbortError") {
          return fileName;
        }
        throw err;
      }
    }
    
    // Fallback: If Web Share API is not available, download the file
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

  // Native mobile share flow - opens share sheet with WhatsApp, Instagram, Email, etc.
  const FileSystem = await import("expo-file-system");
  const fileUri = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: "Share quotation via",
      UTI: "com.adobe.pdf" // iOS needs this for WhatsApp, Email apps to recognize it as PDF
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
  return fileUri;
}

export async function downloadQuotationPdf(
  customer: CustomerDetails,
  headings: Heading[],
  selected: SelectedDish[]
) {
  const { bytes, fileName, base64Data } = await generatePdfBytes(customer, headings, selected);

  if (Platform.OS === "web") {
    // Web: Direct download to user's Downloads folder
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

  // Native mobile download
  const FileSystem = await import("expo-file-system");
  
  if (Platform.OS === "android") {
    // Android: Save to Downloads folder using Storage Access Framework
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri, 
        fileName, 
        "application/pdf"
      );
      await FileSystem.writeAsStringAsync(uri, base64Data, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      return uri;
    } else {
      throw new Error("Storage permission denied. Please grant access to save the file.");
    }
  }

  // iOS: Save to app's document directory and open share sheet (iOS convention)
  const fileUri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, base64Data, { 
    encoding: FileSystem.EncodingType.Base64 
  });
  
  if (await Sharing.isAvailableAsync()) {
    // iOS users download by choosing "Save to Files" from the share sheet
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: "Save PDF",
      UTI: "com.adobe.pdf" 
    });
  } else {
    throw new Error("Cannot save file on this device");
  }
  return fileUri;
}
