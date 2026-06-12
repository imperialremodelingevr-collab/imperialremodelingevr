# Imperial Remodeling EVR — Project Instructions

## Company Information (use in ALL estimates/invoices)
- **Company:** Imperial Remodeling EVR
- **Phone:** (214) 517-1951
- **Email:** imperialremodelingevr@gmail.com
- **Area:** Dallas – Fort Worth Metroplex, TX

## Official Logo — REQUIRED on every estimate/invoice
- Light background (white) version: `public/images/png/8bf2961a-6fbb-4139-8f29-55815197405d.png` — use on light backgrounds
- Dark background version: `public/images/png/931dd399-a8bb-4c6f-a6e6-68d7c9a3eea0.png` — use on dark headers (e.g. #1a1a2e)
- Always embed the logo as base64 inside the HTML so the document works standalone on any device.

## Estimates / Invoices — quality checklist (verify EVERY time before delivery)
1. Logo appears in header (correct version for the background color).
2. Client name, address, phone, and email are correct.
3. Every line-item amount is correct, and phase subtotals add up to the total range.
4. Base estimate falls inside the total range.
5. Estimate number follows format `IRE-YYYY-NNNN` and is unique (check `estimates/` folder).
6. Date and 30-day validity present.
7. Important Note / pricing-conditions clause included.
8. Terms & Conditions and signature lines for both parties included.
9. Language: English, professional tone, ready to send to the client.
10. Deliver BOTH the HTML and a PDF version (generate PDF with WeasyPrint: `python3 -m weasyprint <input.html> <output.pdf>`).

## File conventions
- Save estimates in `estimates/` as `estimate-<client>-<YYYY-MMDD>.html` and matching `.pdf`.
- Brand colors: navy `#1a1a2e`, gold `#c9a84c`.
