# ARKA UI Guidelines

## 1. Design Philosophy

The ARKA Operator Console uses a **modern, light-themed dashboard design**. It prioritizes clarity, data hierarchy, and calm aesthetics, avoiding the dense, intimidating feel of traditional ERP systems.

**Keywords:** Clean, Spacious, Trustworthy, Modern SaaS, Operator-First.

## 2. Visual Hierarchy

1. **Top Level (Context):** Page headers and global status pills. Gives the user immediate context of where they are and what environment they are operating in.
2. **Middle Level (The Subject):** The main case workspace. Large typography for Case IDs, prominent summary blocks (Metric Blocks), and the sequential flow of the audit (Stage Strip).
3. **Bottom Level (Details):** Tabbed views for drilling down into specific evidence, simulations, or proofs.
4. **Sidebar (Navigation & History):** The left rail provides quick access to run scenarios and view past cases without overwhelming the main focus area.

## 3. Color Palette

The interface relies on a clean light background with white elevated cards and distinct status colors.

### Base Colors
- **Background (`--bg`):** `#f4f7f9` (Soft grayish-blue)
- **Elevated / Cards (`--bg-elevated`):** `#ffffff` (Pure white)
- **Muted Backgrounds (`--bg-muted`):** `#f8fafc` (Slate 50)
- **Borders (`--border`):** `#e2e8f0` (Slate 200)

### Typography Colors
- **Primary Text (`--text`):** `#0f172a` (Slate 900) - Used for headings and primary data.
- **Secondary Text (`--text-soft`):** `#64748b` (Slate 500) - Used for labels, subtitles, and metadata.

### Accent & Interactive
- **Primary Accent (`--accent`):** `#4f46e5` (Indigo 600) - Used for primary buttons, active tabs, and highlights.
- **Accent Hover (`--accent-hover`):** `#4338ca` (Indigo 700)

### Status Colors
Semantic colors use a tinted background with a strongly colored text to create "soft pills".
- **Success (Clear / Normal):** Background `#d1fae5`, Text `#065f46`
- **Warning (Moderate / Review):** Background `#fef3c7`, Text `#92400e`
- **Danger (Critical / Escalate):** Background `#fee2e2`, Text `#991b1b`
- **Info (Neutral / Proofs):** Background `#dbeafe`, Text `#1e40af`

## 4. Typography

We use standard, highly legible sans-serif system fonts (`Inter`, `Roboto`, `-apple-system`).

- **Page Titles:** `36px`, Weight `800` (Extra Bold)
- **Section Titles (Cards):** `20px`, Weight `700` (Bold)
- **Data Values (Metric Blocks):** `28px`, Weight `700` (Bold)
- **Body Text:** `15px`, Weight `500` (Medium)
- **Labels / Eyebrows:** `12px` or `13px`, Weight `700`, Uppercase with wide letter-spacing (`0.05em` - `0.1em`).
- **Code / Hashes:** `13px` Monospace font for exact readability.

## 5. Shape & Structure

- **Border Radius:**
  - Large elements (Panels, Cards): `16px`
  - Medium elements (Scenario buttons, metric blocks, inputs): `12px`
  - Small elements (Action buttons, pills): `8px` or fully rounded `999px` for chips.
- **Shadows:**
  - Soft, modern shadows give depth without harshness. 
  - Standard Panel Shadow: `0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)`
  - Hover States: Cards lift slightly (`transform: translateY(-2px)`) with an intensified shadow.

## 6. Component Guidelines

### Metric Blocks
Used for displaying key comparisons (Expected vs Actual). They have a muted background, a small uppercase label, a massive data value, and a small explanatory detail text.

### Stage Strip
A horizontal sequence indicating the lifecycle of an AuditEvent (Order -> Movement -> AuditEvent -> Triage -> Proof). It acts as a breadcrumb of truth.

### Status Pills
Pill-shaped badges (`border-radius: 999px`) used to denote severity, scenario outcomes, and proof states. They must use the "Soft Pill" coloring style (tinted background, dark text) to remain legible without visually overwhelming the user.

### View Tabs
Segmented controls for switching detail views. The active state uses the solid primary accent color (`#4f46e5`) with white text, while inactive states are transparent with soft text.