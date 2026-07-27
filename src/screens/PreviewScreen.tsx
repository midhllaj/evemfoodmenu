import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View, Modal, TouchableOpacity, Linking, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import { Button } from "../components/Button";
import { store } from "../storage/store";
import { AppTheme } from "../theme/theme";
import { CustomerDetails, Heading, SelectedDish } from "../types";
import { createAndSharePdf, downloadQuotationPdf, generatePdfBytes } from "../utils/pdf";
import { LOGO_BASE64 } from "../utils/logo";

type Props = {
  theme: AppTheme;
  customer: CustomerDetails;
  headings: Heading[];
  selected: SelectedDish[];
  onSaveTemplate: () => Promise<void>;
  onBack: () => void;
};

export function PreviewScreen({ theme, customer, headings, selected, onSaveTemplate, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  
  const groups = useMemo(
    () =>
      headings
        .filter((heading) => heading.visible)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((heading) => ({ heading, dishes: selected.filter((dish) => dish.headingId === heading.id) }))
        .filter((group) => group.dishes.length > 0),
    [headings, selected]
  );

  async function sharePdf() {
    console.log("Share PDF clicked, selected dishes:", selected.length);
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select at least one dish before generating the quotation PDF.");
      return;
    }
    setBusy(true);
    try {
      console.log("Generating PDF for sharing...");
      const result = await generatePdfBytes(customer, headings, selected);
      const { uri, fileName } = result;
      
      if (Platform.OS === "web" && uri) {
        // For web, fetch the PDF and try native share or show custom menu
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "application/pdf" });
        
        console.log("Checking for native share API...");
        // Try native share first (works on mobile browsers)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          console.log("Native share available");
          try {
            await navigator.share({
              files: [file],
              title: "Evam Catering Quotation",
              text: "Please find attached the catering menu quotation for your event."
            });
            await store.addPdfHistory(fileName);
            setBusy(false);
            return;
          } catch (err) {
            console.log("Native share error:", err);
            if ((err as Error).name === "AbortError") {
              setBusy(false);
              return;
            }
          }
        }
        
        console.log("Showing custom share menu");
        // Show custom share menu as fallback
        const url = URL.createObjectURL(blob);
        setPdfDataUrl(url);
        setShowShareMenu(true);
        await store.addPdfHistory(fileName);
        setBusy(false);
      } else {
        // Mobile native share
        console.log("Mobile share");
        await store.addPdfHistory(fileName);
        if (uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share quotation via",
            UTI: "com.adobe.pdf"
          });
        }
        setBusy(false);
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Share failed", error instanceof Error ? error.message : "Could not share the quotation.");
      setBusy(false);
    }
  }

  function closeShareMenu() {
    setShowShareMenu(false);
    if (pdfDataUrl) {
      URL.revokeObjectURL(pdfDataUrl);
      setPdfDataUrl("");
    }
  }

  async function shareVia(method: string) {
    const message = encodeURIComponent(`Here is your Evam Catering quotation for ${customer.eventName || "your event"}`);
    const phone = customer.phoneNumber?.replace(/\D/g, "") || "";
    
    if (method === "download") {
      // Download the PDF
      const anchor = document.createElement("a");
      anchor.href = pdfDataUrl;
      anchor.download = `evam-quotation-${customer.customerName || "customer"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      closeShareMenu();
      return;
    }

    let url = "";
    switch (method) {
      case "whatsapp":
        url = `https://wa.me/${phone}?text=${message}`;
        break;
      case "email":
        url = `mailto:${customer.phoneNumber || ""}?subject=${encodeURIComponent("Evam Catering Quotation")}&body=${message}`;
        break;
      case "sms":
        url = `sms:${phone}?body=${message}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(pdfDataUrl)}&text=${message}`;
        break;
    }

    if (url) {
      try {
        if (Platform.OS === "web") {
          window.open(url, "_blank");
        } else {
          await Linking.openURL(url);
        }
        Alert.alert("Note", "PDF link opened. You may need to manually attach the downloaded PDF file.");
      } catch (err) {
        Alert.alert("Error", `Could not open ${method}. Please make sure the app is installed.`);
      }
    }
    closeShareMenu();
  }

  async function downloadPdf() {
    console.log("=== Download PDF Started ===");
    console.log("Selected dishes count:", selected.length);
    
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select at least one dish before downloading the quotation PDF.");
      return;
    }
    
    setBusy(true);
    
    try {
      console.log("Step 1: Starting PDF generation...");
      const result = await generatePdfBytes(customer, headings, selected);
      console.log("Step 2: PDF generated successfully", result.fileName);
      
      const { uri, fileName } = result;
      
      if (Platform.OS === "web" && uri) {
        console.log("Step 3: Reading file from URI for web download...");
        // For web, we need to fetch the PDF and trigger download
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log("Step 4: Blob created, size:", blob.size);
        
        const url = URL.createObjectURL(blob);
        console.log("Step 5: Object URL created");
        
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = "none";
        
        console.log("Step 6: Triggering download...");
        document.body.appendChild(anchor);
        anchor.click();
        
        setTimeout(() => {
          document.body.removeChild(anchor);
          URL.revokeObjectURL(url);
          console.log("Step 7: Cleanup complete");
        }, 100);
        
        Alert.alert("Success", `PDF "${fileName}" is downloading to your device.`);
      }
      
    } catch (error) {
      console.error("=== Download Error ===");
      console.error("Error details:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      Alert.alert("Download failed", error instanceof Error ? error.message : "Could not prepare the quotation PDF.");
    } finally {
      setBusy(false);
      console.log("=== Download PDF Ended ===");
    }
  }

  async function saveTemplate() {
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select dishes before saving a reusable template.");
      return;
    }
    await onSaveTemplate();
    Alert.alert("Template saved", "This selected menu can now be loaded from Templates.");
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Proposal preview</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>A4 luxury PDF using the Evam green and gold palette.</Text>
        </View>
        <MaterialCommunityIcons name="crown-outline" size={28} color={theme.colors.accent} />
      </View>

      <View style={[styles.proposal, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.proposalHeader, { borderBottomColor: theme.colors.primary }]}>
          <Image
            source={{ uri: LOGO_BASE64 }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.details, { backgroundColor: theme.colors.background, borderLeftColor: theme.colors.accent }]}>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Customer: {customer.customerName || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Event: {customer.eventName || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Date: {customer.eventDate || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Guests: {customer.guests || "-"}</Text>
        </View>

        {groups.map((group) => (
          <View key={group.heading.id} style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>{group.heading.name}</Text>
            {group.dishes.map((dish) => (
              <Text key={dish.id} style={[styles.item, { color: theme.colors.text }]}>• {dish.name}</Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Back" theme={theme} variant="ghost" onPress={onBack} style={styles.action} />
        <Button label={busy ? "Generating..." : "Share PDF"} theme={theme} onPress={sharePdf} style={styles.action} />
      </View>
      <Button label={busy ? "Preparing..." : "Download PDF"} theme={theme} onPress={downloadPdf} />
      <Button label="Save Template" theme={theme} variant="soft" onPress={saveTemplate} />

      {/* Share Menu Modal */}
      <Modal
        visible={showShareMenu}
        transparent
        animationType="slide"
        onRequestClose={closeShareMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeShareMenu}
        >
          <View style={[styles.shareMenu, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.shareTitle, { color: theme.colors.text }]}>Share PDF via</Text>
            
            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption} onPress={() => shareVia("whatsapp")}>
                <View style={[styles.shareIcon, { backgroundColor: "#25D366" }]}>
                  <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.text }]}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => shareVia("email")}>
                <View style={[styles.shareIcon, { backgroundColor: "#EA4335" }]}>
                  <MaterialCommunityIcons name="email" size={32} color="#fff" />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.text }]}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => shareVia("telegram")}>
                <View style={[styles.shareIcon, { backgroundColor: "#0088cc" }]}>
                  <MaterialCommunityIcons name="send" size={32} color="#fff" />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.text }]}>Telegram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => shareVia("sms")}>
                <View style={[styles.shareIcon, { backgroundColor: "#34C759" }]}>
                  <MaterialCommunityIcons name="message-text" size={32} color="#fff" />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.text }]}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => shareVia("download")}>
                <View style={[styles.shareIcon, { backgroundColor: theme.colors.accent }]}>
                  <MaterialCommunityIcons name="download" size={32} color="#fff" />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.text }]}>Download</Text>
              </TouchableOpacity>
            </View>

            <Button label="Cancel" theme={theme} variant="ghost" onPress={closeShareMenu} />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 36
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 3,
    fontSize: 14
  },
  proposal: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    gap: 16
  },
  proposalHeader: {
    borderBottomWidth: 3,
    paddingBottom: 14,
    alignItems: "center"
  },
  logoImage: {
    width: 180,
    height: 70,
    alignSelf: "center"
  },
  brand: {
    fontSize: 20,
    fontWeight: "900"
  },
  brandMeta: {
    marginTop: 2,
    fontSize: 12
  },
  gold: {
    fontWeight: "900"
  },
  details: {
    borderLeftWidth: 5,
    padding: 12,
    gap: 4
  },
  detailText: {
    fontSize: 13,
    fontWeight: "700"
  },
  group: {
    gap: 6
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "900",
    borderBottomWidth: 1,
    paddingBottom: 6
  },
  item: {
    fontSize: 14,
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  action: {
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  shareMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 20
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center"
  },
  shareOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 20
  },
  shareOption: {
    alignItems: "center",
    gap: 8,
    width: 80
  },
  shareIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  shareLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  }
});
