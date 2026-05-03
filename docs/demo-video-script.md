# ARKA: 3-Minute Demo Video Script

**Theme / Vibe:** Clear, concise, professional, highlighting the Web3 integration.

## 0:00 - 0:30 | 1. Landing Page & Value Prop

**Visual (Screen Action):**
Start on the ARKA Landing Page. Slowly scroll down to show the hero section and the core value proposition. Emphasize the clean Neumorphic (Soft UI) theme. Hover over a couple of interactive elements.

**Voiceover (Audio):**
"Welcome to ARKA. In the physical world of retail and hospitality, inventory goes missing every day—due to spills, mistakes, or theft. Traditional point-of-sale systems only know what was sold, completely ignoring what was actually used. ARKA bridges this gap. We provide 'Immutable Auditing for the Physical World' by reconciling business intent with physical reality, and securing that truth using the 0G Network."

## 0:30 - 1:00 | 2. Operator Console / Dashboard

**Visual (Screen Action):**
Click into the "Operator Console" (Dashboard). Briefly point out the main sections: "Scenario Control" on the left, the "Case History" list, and the central workspace showing the status stack (LOCAL, DB mode, SIMULATED Agent).

**Voiceover (Audio):**
"Let's step into the Operator Console. This is where managers or auditors review cases. On the left, we can run predefined scenarios or trigger custom manual overrides. In the center, we see the complete breakdown of a case, from the business order to the actual physical movement."

## 1:00 - 1:45 | 3. "Run Movement" & 4. Review the Variance

**Visual (Screen Action):**
In the left sidebar, under "Scenario Control", ensure the view is set to "Run Movement" (Manual Override).
- Type `3` in "Protein Shake quantity".
- Type `160` in "Whey Protein OUT grams".
- Click the **"Run movement simulation"** button.
The UI updates to show the new Case ID, highlighting a large red "Difference" metric and the "CRITICAL_REVIEW" status pill.

**Voiceover (Audio):**
"Let's simulate an inventory drift. We input an order of 3 protein shakes. According to our usage rules, this should consume 90 grams of whey protein. But what if our physical smart scale detects that 160 grams actually left the container? We hit run. Instantly, ARKA calculates the variance—a massive +70g difference. Because this variance is so high, our deterministic triage engine immediately escalates the case to 'Critical Review', requiring owner intervention."

## 1:45 - 2:30 | 5. Proof Status & 0G Anchoring

**Visual (Screen Action):**
Click the **"Proof Status"** tab in the main workspace navigation.
- Show the "0G Storage Upload" panel. Click the **"Upload proof to 0G Storage"** button. Wait a moment for it to succeed.
- Highlight the newly appeared `STORED_ON_0G` pill and the local package hash.
- Scroll to "0G Chain Registration". Click **"Register proof on 0G Chain"**. Wait for success.
- Scroll back up to the "Verified Web3 proof" card. Highlight the `VERIFIED` pills, the `0G Storage tx`, and the `0G Chain tx` links. Click one of the explorer links to open the chain explorer in a new tab.

**Voiceover (Audio):**
"Now, we need to secure this evidence. We move to the Proof Status tab. First, we take the entire physical audit event—order details, movement logs, and the triage outcome—and upload it to 0G Storage. This generates a cryptographic root hash. Next, we anchor that root hash permanently on the 0G Galileo Testnet. In just a few clicks, we have a fully verifiable Web3 proof package. As you can see, the transaction is now live on the 0G block explorer."

## 2:30 - 3:00 | 6. Conclusion

**Visual (Screen Action):**
Switch back to the ARKA console. Click the Neumorphic **"Reset History"** button in the sidebar to show how easily the demo environment cleans up for the next run. End on a wide shot of the dashboard.

**Voiceover (Audio):**
"By leveraging the high-throughput 0G Network, ARKA transforms scattered physical data into undeniable, tamper-proof operational evidence. Whether it's a small discrepancy or a critical missing item, owners and auditors now have an immutable source of truth they can trust. Thank you for watching our ETHGlobal submission."
