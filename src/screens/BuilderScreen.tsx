import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { categories } from "../data/seed";
import { AppTheme } from "../theme/theme";
import { Dish, Heading, SelectedDish } from "../types";
import { makeId } from "../utils/id";
import { generatePdfBytes, buildQuotationHtml } from "../utils/pdf";
import { store } from "../storage/store";

type Props = {
  theme: AppTheme;
  headings: Heading[];
  dishes: Dish[];
  selectedDishes: Record<string, SelectedDish>;
  onSelectedChange: (selected: Record<string, SelectedDish>) => void;
  onHeadingsChange: (headings: Heading[]) => void;
  onDishesChange: (dishes: Dish[]) => void;
  onBack: () => void;
  onPreview: () => void;
  customer: any;
};

export function BuilderScreen({
  theme,
  headings,
  dishes,
  selectedDishes,
  onSelectedChange,
  onHeadingsChange,
  onDishesChange,
  onBack,
  onPreview,
  customer
}: Props) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [headingSearch, setHeadingSearch] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sectionAddOpen, setSectionAddOpen] = useState<Record<string, boolean>>({});
  const [sectionDishNames, setSectionDishNames] = useState<Record<string, string>>({});
  const [newHeading, setNewHeading] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pdfUri, setPdfUri] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [addSubDishOpen, setAddSubDishOpen] = useState<Record<string, boolean>>({});
  const [newSubDishName, setNewSubDishName] = useState<Record<string, string>>({});
  const [editingHeadingId, setEditingHeadingId] = useState<string | null>(null);
  const [editingHeadingName, setEditingHeadingName] = useState("");

  const sortedHeadings = useMemo(
    () => headings.filter((heading) => heading.visible).sort((a, b) => a.displayOrder - b.displayOrder),
    [headings]
  );

  const selectedDishesArray = useMemo(() => Object.values(selectedDishes), [selectedDishes]);

  function toggleParentDish(parentDish: Dish) {
    const subDishes = dishes.filter(d => d.parentDishId === parentDish.id);
    const allSelected = subDishes.every(sub => selectedDishes[sub.id]);
    
    const next = { ...selectedDishes };
    
    if (allSelected) {
      // Deselect all sub-dishes
      subDishes.forEach(sub => {
        delete next[sub.id];
      });
    } else {
      // Select all sub-dishes
      subDishes.forEach(sub => {
        next[sub.id] = sub;
      });
    }
    
    onSelectedChange(next);
  }

  function toggleExpandParent(parentDishId: string) {
    setExpandedParents(prev => ({ ...prev, [parentDishId]: !prev[parentDishId] }));
  }

  async function openPreview() {
    console.log("=== Preview clicked ===");
    console.log("Selected dishes:", selectedDishesArray.length);
    console.log("Customer:", customer);
    
    if (!selectedDishesArray.length) {
      Alert.alert("No dishes selected", "Please select at least one dish to preview the PDF.");
      return;
    }
    setIsGenerating(true);
    setShowPreviewModal(true); // Show modal immediately
    try {
      console.log("Generating PDF preview...");
      const result = await generatePdfBytes(customer, headings, selectedDishesArray);
      console.log("PDF generated:", result);
      if (result.uri) {
        console.log("PDF URI:", result.uri);
        setPdfUri(result.uri);
      } else {
        console.error("No URI returned from PDF generation");
        Alert.alert("Preview failed", "Could not generate PDF preview.");
        setShowPreviewModal(false);
      }
    } catch (error) {
      console.error("=== Preview error ===");
      console.error("Error:", error);
      console.error("Stack:", error instanceof Error ? error.stack : "No stack");
      Alert.alert("Preview failed", error instanceof Error ? error.message : "Could not generate PDF preview.");
      setShowPreviewModal(false);
    } finally {
      setIsGenerating(false);
    }
  }

  function closePreview() {
    setShowPreviewModal(false);
    setPdfUri("");
  }

  async function downloadPdf() {
    if (!pdfUri) return;
    try {
      if (Platform.OS === "web") {
        // For web, generate PDF using html2canvas and jsPDF
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;
        
        // Create a temporary container to render the HTML
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = "595px";
        document.body.appendChild(container);
        
        // Fetch and render the HTML
        const response = await fetch(pdfUri);
        const htmlContent = await response.text();
        container.innerHTML = htmlContent;
        
        // Wait for images to load
        const images = container.getElementsByTagName("img");
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) {
                  resolve(null);
                } else {
                  img.onload = () => resolve(null);
                  img.onerror = () => resolve(null);
                }
              })
          )
        );
        
        // Generate canvas from HTML
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 595,
          windowWidth: 595
        });
        
        // A4 dimensions in pixels at 72 DPI
        const a4Width = 595;
        const a4Height = 842;
        
        // Create PDF with A4 dimensions
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [a4Width, a4Height]
        });
        
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = a4Width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageCount = 0;
        
        // Add first page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= a4Height;
        
        // Add additional pages if content is longer than one A4 page
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= a4Height;
          pageCount++;
        }
        
        // Clean up
        document.body.removeChild(container);
        
        // Get filename from customer details
        const fileName = `${customer.customerName || customer.eventName || "evam-quotation"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "evam-quotation";
        
        // Download the PDF
        pdf.save(`${fileName}.pdf`);
        Alert.alert("Success", "PDF downloaded successfully!");
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: "application/pdf",
            dialogTitle: "Download PDF",
            UTI: "com.adobe.pdf"
          });
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Download failed", error instanceof Error ? error.message : "Could not download PDF.");
    }
  }

  async function sharePdf() {
    if (!pdfUri) return;
    try {
      if (Platform.OS === "web") {
        // For web, open print dialog which allows saving as PDF or sharing
        const printWindow = window.open(pdfUri, '_blank');
        if (printWindow) {
          Alert.alert("Share", "Please use your browser's share or save options to share the PDF.");
        } else {
          Alert.alert("Popup blocked", "Please allow popups to share the PDF.");
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: "application/pdf",
            dialogTitle: "Share quotation via",
            UTI: "com.adobe.pdf"
          });
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        Alert.alert("Share failed", error instanceof Error ? error.message : "Could not share PDF.");
      }
    }
  }

  const filteredDishes = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    return dishes
      .filter((dish) => !dish.parentDishId) // Only show parent dishes or standalone dishes, not sub-dishes
      .filter((dish) => (query ? dish.name.toLowerCase().includes(query) || dish.category.toLowerCase().includes(query) : true))
      .filter((dish) => (selectedCategories.length ? selectedCategories.includes(dish.category) : true))
      .sort((a, b) => {
        // Kerala Sadya parent dish always appears first
        if (a.isParent && a.category === "Kerala Sadya") return -1;
        if (b.isParent && b.category === "Kerala Sadya") return 1;
        // Then sort by favorite status
        const favoriteSort = Number(Boolean(b.favorite)) - Number(Boolean(a.favorite));
        if (favoriteSort !== 0) return favoriteSort;
        // Finally sort alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [dishes, globalSearch, selectedCategories]);

  function toggleDish(dish: Dish) {
    const next = { ...selectedDishes };
    if (next[dish.id]) {
      delete next[dish.id];
    } else {
      next[dish.id] = dish;
    }
    onSelectedChange(next);
  }

  function updateSelectedDish(id: string, patch: Partial<SelectedDish>) {
    if (!selectedDishes[id]) return;
    onSelectedChange({ ...selectedDishes, [id]: { ...selectedDishes[id], ...patch } });
  }

  function addHeading() {
    const name = newHeading.trim();
    if (!name) return;
    const heading: Heading = {
      id: makeId("heading"),
      name,
      displayOrder: headings.length + 1,
      visible: true
    };
    onHeadingsChange([...headings, heading]);
    setNewHeading("");
  }

  function startEditHeading(heading: Heading) {
    setEditingHeadingId(heading.id);
    setEditingHeadingName(heading.name);
  }

  function cancelEditHeading() {
    setEditingHeadingId(null);
    setEditingHeadingName("");
  }

  function saveEditHeading(headingId: string) {
    const name = editingHeadingName.trim();
    if (!name) return;
    onHeadingsChange(headings.map((item) => (item.id === headingId ? { ...item, name } : item)));
    cancelEditHeading();
  }

  function addSubDishToParent(parentDish: Dish) {
    const name = (newSubDishName[parentDish.id] ?? "").trim();
    if (!name) return;
    const newDish: Dish = {
      id: makeId("dish"),
      name,
      category: parentDish.category,
      headingId: parentDish.headingId,
      parentDishId: parentDish.id
    };
    onDishesChange([...dishes, newDish]);
    setNewSubDishName({ ...newSubDishName, [parentDish.id]: "" });
    setAddSubDishOpen({ ...addSubDishOpen, [parentDish.id]: false });
  }

  function addSectionDish(heading: Heading, headingDishes: Dish[]) {
    const name = (sectionDishNames[heading.id] ?? "").trim();
    if (!name) return;
    const dish: Dish = {
      id: makeId("dish"),
      name,
      category: headingDishes[0]?.category ?? "Custom",
      headingId: heading.id
    };
    onDishesChange([...dishes, dish]);
    setSectionDishNames({ ...sectionDishNames, [heading.id]: "" });
    setSectionAddOpen({ ...sectionAddOpen, [heading.id]: false });
  }

  function dishActions(dish: Dish) {
    Alert.alert(dish.name, "Quick dish actions", [
      {
        text: dish.favorite ? "Remove Favorite" : "Mark Favorite",
        onPress: () =>
          onDishesChange(dishes.map((item) => (item.id === dish.id ? { ...item, favorite: !item.favorite } : item)))
      },
      {
        text: "Duplicate",
        onPress: () => onDishesChange([...dishes, { ...dish, id: makeId("dish"), name: `${dish.name} Copy` }])
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDishesChange(dishes.filter((item) => item.id !== dish.id))
      },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  function toggleCategory(category: string) {
    if (category === "Kerala Sadya" && !selectedCategories.includes(category)) {
      const sadyaDishes = dishes.filter((dish) => dish.category === "Kerala Sadya");
      const next = { ...selectedDishes };
      sadyaDishes.forEach((dish) => {
        next[dish.id] = next[dish.id] ?? dish;
      });
      onSelectedChange(next);
    }
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Menu builder</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{Object.keys(selectedDishes).length} dishes selected</Text>
        </View>
        <Pressable onPress={openPreview} style={[styles.previewIcon, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="eye" size={24} color={theme.colors.white} />
        </Pressable>
      </View>

      <TextInput
        value={globalSearch}
        onChangeText={setGlobalSearch}
        placeholder="Search chicken, fish, juice, sadya, mandi..."
        placeholderTextColor={theme.colors.muted}
        style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={selectedCategories.includes(category)}
            theme={theme}
            onPress={() => toggleCategory(category)}
          />
        ))}
      </ScrollView>

      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Heading Management</Text>
        <View style={styles.inline}>
          <TextInput
            value={newHeading}
            onChangeText={setNewHeading}
            placeholder="Add heading"
            placeholderTextColor={theme.colors.muted}
            style={[styles.inlineInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          />
          <Button label="Save" theme={theme} onPress={addHeading} style={styles.smallButton} />
        </View>
        <View style={styles.headingList}>
          {headings.map((heading) => (
            <Pressable
              key={heading.id}
              onPress={() => onHeadingsChange(headings.map((item) => (item.id === heading.id ? { ...item, visible: !item.visible } : item)))}
              style={[styles.headingPill, { borderColor: theme.colors.border, backgroundColor: heading.visible ? theme.colors.accentSoft : "transparent" }]}
            >
              <Text style={[styles.headingPillText, { color: theme.colors.text }]}>{heading.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {sortedHeadings.map((heading) => {
        const localQuery = (headingSearch[heading.id] ?? "").toLowerCase();
        const headingDishes = filteredDishes.filter((dish) => dish.headingId === heading.id && (!localQuery || dish.name.toLowerCase().includes(localQuery)));
        if (!headingDishes.length && globalSearch) return null;
        const isEditingHeading = editingHeadingId === heading.id;
        return (
          <View key={heading.id} style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              {isEditingHeading ? (
                <>
                  <TextInput
                    value={editingHeadingName}
                    onChangeText={setEditingHeadingName}
                    autoFocus
                    selectTextOnFocus
                    placeholder="Heading name"
                    placeholderTextColor={theme.colors.muted}
                    style={[styles.headingEditInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                    onSubmitEditing={() => saveEditHeading(heading.id)}
                  />
                  <Pressable
                    onPress={() => saveEditHeading(heading.id)}
                    style={[styles.headingIconButton, { backgroundColor: theme.colors.primary }]}
                  >
                    <MaterialCommunityIcons name="check" size={18} color={theme.colors.white} />
                  </Pressable>
                  <Pressable
                    onPress={cancelEditHeading}
                    style={[styles.headingIconButton, { borderColor: theme.colors.border }]}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={theme.colors.text} />
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{heading.name}</Text>
                  <Pressable
                    onPress={() => startEditHeading(heading)}
                    style={[styles.headingIconButton, { borderColor: theme.colors.border }]}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.text} />
                  </Pressable>
                </>
              )}
            </View>
            <TextInput
              value={headingSearch[heading.id] ?? ""}
              onChangeText={(value) => setHeadingSearch({ ...headingSearch, [heading.id]: value })}
              placeholder={`Search inside ${heading.name}`}
              placeholderTextColor={theme.colors.muted}
              style={[styles.innerSearch, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />
            {headingDishes.map((dish) => {
              const isParent = dish.isParent;
              const subDishes = isParent ? dishes.filter(d => d.parentDishId === dish.id) : [];
              const isExpanded = expandedParents[dish.id];
              const allSubSelected = isParent && subDishes.length > 0 && subDishes.every(sub => selectedDishes[sub.id]);
              const someSubSelected = isParent && subDishes.some(sub => selectedDishes[sub.id]);
              const selected = selectedDishes[dish.id];
              
              return (
                <View key={dish.id}>
                  <Pressable onLongPress={() => dishActions(dish)} style={styles.dishRow}>
                    <Pressable 
                      onPress={() => isParent ? toggleParentDish(dish) : toggleDish(dish)} 
                      style={[
                        styles.checkbox, 
                        { 
                          borderColor: theme.colors.primary, 
                          backgroundColor: (isParent ? allSubSelected : selected) ? theme.colors.primary : "transparent",
                          opacity: (isParent && someSubSelected && !allSubSelected) ? 0.5 : 1
                        }
                      ]}
                    >
                      {(isParent ? allSubSelected : selected) ? <MaterialCommunityIcons name="check" size={18} color={theme.colors.white} /> : null}
                      {(isParent && someSubSelected && !allSubSelected) ? <MaterialCommunityIcons name="minus" size={18} color={theme.colors.white} /> : null}
                    </Pressable>
                    <View style={styles.dishBody}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.dishName, { color: theme.colors.text }]}>
                          {dish.favorite ? "★ " : ""}
                          {dish.name}
                        </Text>
                        {isParent && subDishes.length > 0 ? (
                          <Pressable onPress={() => toggleExpandParent(dish.id)}>
                            <MaterialCommunityIcons 
                              name={isExpanded ? "chevron-up" : "chevron-down"} 
                              size={24} 
                              color={theme.colors.primary} 
                            />
                          </Pressable>
                        ) : null}
                      </View>
                      <Text style={[styles.dishMeta, { color: theme.colors.muted }]}>
                        {dish.category}
                        {isParent && subDishes.length > 0 ? ` (${subDishes.length} items)` : ""}
                      </Text>
                      {selected && !isParent ? (
                        <View style={styles.selectedFields}>
                          <TextInput
                            value={selected.quantity}
                            onChangeText={(quantity) => updateSelectedDish(dish.id, { quantity })}
                            placeholder="Qty"
                            placeholderTextColor={theme.colors.muted}
                            style={[styles.miniInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                          />
                          <TextInput
                            value={selected.remarks}
                            onChangeText={(remarks) => updateSelectedDish(dish.id, { remarks })}
                            placeholder="Remarks"
                            placeholderTextColor={theme.colors.muted}
                            style={[styles.remarksInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                          />
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                  
                  {/* Sub-dishes */}
                  {isParent && isExpanded && subDishes.map((subDish) => {
                    const subSelected = selectedDishes[subDish.id];
                    return (
                      <Pressable key={subDish.id} onLongPress={() => dishActions(subDish)} style={[styles.dishRow, styles.subDishRow]}>
                        <View style={{ width: 28 }} />
                        <Pressable 
                          onPress={() => toggleDish(subDish)} 
                          style={[styles.checkbox, styles.subCheckbox, { borderColor: theme.colors.primary, backgroundColor: subSelected ? theme.colors.primary : "transparent" }]}
                        >
                          {subSelected ? <MaterialCommunityIcons name="check" size={16} color={theme.colors.white} /> : null}
                        </Pressable>
                        <View style={styles.dishBody}>
                          <Text style={[styles.dishName, styles.subDishName, { color: theme.colors.text }]}>
                            {subDish.name}
                          </Text>
                          {subSelected ? (
                            <View style={styles.selectedFields}>
                              <TextInput
                                value={subSelected.quantity}
                                onChangeText={(quantity) => updateSelectedDish(subDish.id, { quantity })}
                                placeholder="Qty"
                                placeholderTextColor={theme.colors.muted}
                                style={[styles.miniInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                              />
                              <TextInput
                                value={subSelected.remarks}
                                onChangeText={(remarks) => updateSelectedDish(subDish.id, { remarks })}
                                placeholder="Remarks"
                                placeholderTextColor={theme.colors.muted}
                                style={[styles.remarksInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                              />
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                  
                  {/* Add Sub-Dish UI for parent dishes when expanded */}
                  {isParent && isExpanded && (
                    addSubDishOpen[dish.id] ? (
                      <View style={[styles.subDishRow, styles.subDishAddPanel, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                        <View style={{ width: 28 }} />
                        <View style={{ flex: 1 }}>
                          <TextInput
                            value={newSubDishName[dish.id] ?? ""}
                            onChangeText={(value) => setNewSubDishName({ ...newSubDishName, [dish.id]: value })}
                            placeholder={`Add item to ${dish.name}`}
                            placeholderTextColor={theme.colors.muted}
                            style={[styles.subDishAddInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                          />
                          <View style={styles.subDishAddActions}>
                            <Button
                              label="Cancel"
                              theme={theme}
                              variant="ghost"
                              onPress={() => setAddSubDishOpen({ ...addSubDishOpen, [dish.id]: false })}
                              style={styles.subDishAddButton}
                            />
                            <Button
                              label="Add"
                              theme={theme}
                              onPress={() => addSubDishToParent(dish)}
                              style={styles.subDishAddButton}
                            />
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setAddSubDishOpen({ ...addSubDishOpen, [dish.id]: true })}
                        style={[styles.subDishRow, styles.addSubDishButton, { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft }]}
                      >
                        <View style={{ width: 28 }} />
                        <MaterialCommunityIcons name="plus" size={18} color={theme.colors.text} />
                        <Text style={[styles.addSubDishText, { color: theme.colors.text }]}>Add Item</Text>
                      </Pressable>
                    )
                  )}
                </View>
              );
            })}
            {sectionAddOpen[heading.id] ? (
              <View style={[styles.sectionAddPanel, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                <TextInput
                  value={sectionDishNames[heading.id] ?? ""}
                  onChangeText={(value) => setSectionDishNames({ ...sectionDishNames, [heading.id]: value })}
                  placeholder={`New item in ${heading.name}`}
                  placeholderTextColor={theme.colors.muted}
                  style={[styles.sectionAddInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                />
                <View style={styles.sectionAddActions}>
                  <Button
                    label="Cancel"
                    theme={theme}
                    variant="ghost"
                    onPress={() => setSectionAddOpen({ ...sectionAddOpen, [heading.id]: false })}
                    style={styles.sectionAddButton}
                  />
                  <Button
                    label="Save Item"
                    theme={theme}
                    onPress={() => addSectionDish(heading, headingDishes)}
                    style={styles.sectionAddButton}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setSectionAddOpen({ ...sectionAddOpen, [heading.id]: true })}
                style={({ pressed }) => [
                  styles.addItemButton,
                  { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft, opacity: pressed ? 0.72 : 1 }
                ]}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.text} />
                <Text style={[styles.addItemText, { color: theme.colors.text }]}>Add Item</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <View style={styles.actions}>
        <Button label="Back" theme={theme} variant="ghost" onPress={onBack} style={styles.action} />
        <Button label={isGenerating ? "Generating..." : "Preview PDF"} theme={theme} onPress={openPreview} style={styles.action} />
      </View>

      {/* PDF Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.previewModal, { backgroundColor: theme.colors.background }]}>
            {/* Header with title and X button */}
            <View style={[styles.previewHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Quotation Preview</Text>
              <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* PDF Content Area - No Theme Selector */}
            <View style={styles.previewContentWrapper}>
              {pdfUri && Platform.OS === "web" ? (
                <iframe
                  src={pdfUri}
                  style={{ 
                    width: "100%", 
                    height: "100%",
                    border: "none", 
                    backgroundColor: "#F9F7F0",
                    overflow: "auto"
                  }}
                  title="PDF Preview"
                />
              ) : pdfUri ? (
                <View style={styles.previewPlaceholder}>
                  <MaterialCommunityIcons name="file-pdf-box" size={64} color={theme.colors.primary} />
                  <Text style={[styles.previewPlaceholderText, { color: theme.colors.text }]}>
                    PDF Ready
                  </Text>
                  <Text style={[styles.previewSubtext, { color: theme.colors.muted }]}>
                    Use the Download button below to view and save the PDF
                  </Text>
                </View>
              ) : (
                <View style={styles.previewPlaceholder}>
                  <MaterialCommunityIcons name="loading" size={64} color={theme.colors.primary} />
                  <Text style={[styles.previewPlaceholderText, { color: theme.colors.text }]}>
                    Generating PDF...
                  </Text>
                </View>
              )}
            </View>

            {/* Footer with buttons aligned right */}
            <View style={styles.previewFooter}>
              <View style={styles.previewButtonsRight}>
                <Button 
                  label="Close" 
                  theme={theme} 
                  variant="ghost" 
                  onPress={closePreview} 
                  style={styles.footerButton} 
                />
                <Button 
                  label="Download PDF" 
                  theme={theme} 
                  onPress={downloadPdf} 
                  style={styles.footerButton}
                  icon={<MaterialCommunityIcons name="download" size={18} color={theme.colors.white} />}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 40
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
    marginTop: 2,
    fontSize: 14
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15
  },
  chips: {
    gap: 8,
    paddingRight: 18
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 12
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "900"
  },
  inline: {
    flexDirection: "row",
    gap: 8
  },
  inlineInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  smallButton: {
    minWidth: 86
  },
  headingList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  headingPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  headingPillText: {
    fontWeight: "800",
    fontSize: 12
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  sectionHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "900"
  },
  headingEditInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 17,
    fontWeight: "800"
  },
  headingIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  innerSearch: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12
  },
  dishRow: {
    flexDirection: "row",
    gap: 11,
    paddingVertical: 10
  },
  subDishRow: {
    paddingLeft: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.02)"
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  subCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 5
  },
  dishBody: {
    flex: 1,
    gap: 3
  },
  dishName: {
    fontSize: 15,
    fontWeight: "800"
  },
  subDishName: {
    fontSize: 14,
    fontWeight: "600"
  },
  dishMeta: {
    fontSize: 12
  },
  addItemButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "900"
  },
  sectionAddPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    marginTop: 4
  },
  sectionAddInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  sectionAddActions: {
    flexDirection: "row",
    gap: 8
  },
  sectionAddButton: {
    flex: 1,
    minHeight: 44
  },
  selectedFields: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  miniInput: {
    width: 72,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10
  },
  remarksInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12
  },
  previewModal: {
    width: "100%",
    maxWidth: 900,
    height: "95%",
    maxHeight: 800,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16
  },
  previewContent: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f5f5f5",
    overflow: "hidden"
  },
  previewContentWrapper: {
    flex: 1,
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  pdfContainer: {
    width: "100%",
    minHeight: 450,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    minHeight: 300,
    padding: 20
  },
  previewPlaceholderText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  },
  previewSubtext: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20
  },
  previewFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  previewButtonsRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap"
  },
  footerButton: {
    minWidth: 110,
    paddingHorizontal: 12,
    minHeight: 46
  },
  addSubDishButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingLeft: 34,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4
  },
  addSubDishText: {
    fontSize: 13,
    fontWeight: "700"
  },
  subDishAddPanel: {
    paddingVertical: 10,
    paddingRight: 10,
    gap: 8
  },
  subDishAddInput: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13
  },
  subDishAddActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6
  },
  subDishAddButton: {
    flex: 1,
    minHeight: 38
  }
});
