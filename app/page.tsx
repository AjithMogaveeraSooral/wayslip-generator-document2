"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import styles from "./page.module.css";

type FormState = {
  date: string;
  serialNo: string;
  weighbridgeName: string;
  weighbridgeAddress: string;
  phone: string;
  ticketNo: string;
  vehicleNo: string;
  party: string;
  product: string;
  loadedWt: string;
  emptyWt: string;
  charges: string;
  printedFor: string;
  printedAt: string;
};

type PdfOrientation = "landscape" | "portrait";

const initialState: FormState = {
  date: "25/02/2026",
  serialNo: "2476545",
  weighbridgeName: "DIX WEIGHBRIDGE",
  weighbridgeAddress: "NH-66, NEAR SALES TAX OFFICE, MAHAGE PH",
  phone: "7020474099",
  ticketNo: "DM162966",
  vehicleNo: "KA01AD1685",
  party: "Others",
  product: "PlastikScrap",
  loadedWt: "9180",
  emptyWt: "0",
  charges: "1400",
  printedFor: "DIX WEIGHBRIDGE",
  printedAt: "25/02/2026 10:55 AM",
};

const parseWeight = (value: string) => {
  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const fit = (value: string, width: number) => {
  const text = value.trim();
  if (text.length >= width) {
    return text.slice(0, width);
  }
  return text.padEnd(width, " ");
};

const center = (value: string, width: number) => {
  const text = value.trim();
  if (text.length >= width) {
    return text.slice(0, width);
  }
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
};

const row = (left: string, right = "", splitAt = 38, total = 78) => {
  const leftPart = fit(left, splitAt);
  const rightWidth = Math.max(total - splitAt, 0);
  const rightPart = fit(right, rightWidth);
  return `${leftPart}${rightPart}`;
};

const rowRight = (left: string, right = "", splitAt = 38, total = 78) => {
  const leftPart = fit(left, splitAt);
  const rightWidth = Math.max(total - splitAt, 0);
  const rightText = right.trim();
  const clipped = rightText.length > rightWidth ? rightText.slice(0, rightWidth) : rightText;
  const rightPart = clipped.padStart(rightWidth, " ");
  return `${leftPart}${rightPart}`;
};

const rowThreeRight = (
  left: string,
  middle: string,
  right: string,
  leftWidth = 20,
  middleWidth = 32,
  total = 78,
) => {
  const rightWidth = Math.max(total - leftWidth - middleWidth, 0);
  const rightText = right.trim();
  const clipped = rightText.length > rightWidth ? rightText.slice(0, rightWidth) : rightText;
  return `${fit(left, leftWidth)}${fit(middle, middleWidth)}${clipped.padStart(rightWidth, " ")}`;
};

export default function Home() {
  const [data, setData] = useState<FormState>(initialState);
  const [downloadingOrientation, setDownloadingOrientation] = useState<PdfOrientation | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData((previous) => ({ ...previous, [name]: value }));
  };

  const ticketText = useMemo(() => {
    const total = 78;
    const loaded = parseWeight(data.loadedWt);
    const empty = parseWeight(data.emptyWt);
    const loadedText = loaded === null ? "" : `${Math.max(loaded, 0)} KGS`;
    const emptyText = empty === null ? "" : `${Math.max(empty, 0)} KGS`;
    const netNumber = loaded === null || empty === null ? "0" : String(Math.max(loaded - empty, 0));
    const netText = `${netNumber} KGS`;
    const chargeText = `Rs. ${Number(data.charges || 0).toFixed(2)}`;

    return [
      row("", `DATE:${data.date}`, 56, total),
      center(data.weighbridgeName, total),
      center("COMPUTERISED 40 TONNES CAPACITY", total),
      center(`${data.weighbridgeAddress} : ${data.serialNo}`, total),
      center("WEIGHMENTS SLP", total),
      "",
      row(`TSNO     : ${data.ticketNo}`, `PARTY   : ${data.party}`, 39, total),
      row(`VEHICLE  : ${data.vehicleNo}`, `PRODUCT : ${data.product}`, 39, total),
      "",
      rowThreeRight("LOADED WT :", data.printedAt, loadedText, 20, 38, total),
      rowRight("EMPTY WT  :", emptyText, 39, total),
      rowRight("NET WT    :", netText, 39, total),
      "",
      rowRight(`CHARGES   : ${chargeText}`, `For ${data.printedFor}`, 39, total),
    ].join("\n");
  }, [
    data.charges,
    data.date,
    data.emptyWt,
    data.loadedWt,
    data.party,
    data.printedAt,
    data.printedFor,
    data.product,
    data.serialNo,
    data.ticketNo,
    data.vehicleNo,
    data.weighbridgeAddress,
    data.weighbridgeName,
  ]);

  const downloadPdf = async (orientation: PdfOrientation) => {
    const node = documentRef.current;
    if (!node) {
      return;
    }

    try {
      setDownloadingOrientation(orientation);
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF(orientation, "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(width / canvas.width, height / canvas.height);

      const renderWidth = canvas.width * ratio;
      const renderHeight = canvas.height * ratio;
      const x = (width - renderWidth) / 2;
      const y = (height - renderHeight) / 2;

      pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight);
      pdf.save(`weighbridge-slip-document2-${orientation}-${Date.now()}.pdf`);
    } finally {
      setDownloadingOrientation(null);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.formPanel}>
        <h1>Document2 Slip Generator</h1>
        <p>Update values to match your weighbridge slip and export to PDF.</p>

        <div className={styles.formGrid}>
          <label>
            DATE
            <input name="date" value={data.date} onChange={handleChange} />
          </label>
          <label>
            SERIAL NO.
            <input name="serialNo" value={data.serialNo} onChange={handleChange} />
          </label>
          <label>
            WEIGHBRIDGE NAME
            <input name="weighbridgeName" value={data.weighbridgeName} onChange={handleChange} />
          </label>
          <label>
            WEIGHBRIDGE ADDRESS
            <input name="weighbridgeAddress" value={data.weighbridgeAddress} onChange={handleChange} />
          </label>
          <label>
            PHONE
            <input name="phone" value={data.phone} onChange={handleChange} />
          </label>
          <label>
            TSNO
            <input name="ticketNo" value={data.ticketNo} onChange={handleChange} />
          </label>
          <label>
            VEHICLE NO.
            <input name="vehicleNo" value={data.vehicleNo} onChange={handleChange} />
          </label>
          <label>
            PARTY
            <input name="party" value={data.party} onChange={handleChange} />
          </label>
          <label>
            PRODUCT
            <input name="product" value={data.product} onChange={handleChange} />
          </label>
          <label>
            LOADED WT (KGS)
            <input name="loadedWt" value={data.loadedWt} onChange={handleChange} />
          </label>
          <label>
            EMPTY WT (KGS)
            <input name="emptyWt" value={data.emptyWt} onChange={handleChange} />
          </label>
          <label>
            CHARGES (RS.)
            <input name="charges" value={data.charges} onChange={handleChange} />
          </label>
          <label>
            PRINTED FOR
            <input name="printedFor" value={data.printedFor} onChange={handleChange} />
          </label>
          <label>
            PRINTED AT
            <input name="printedAt" value={data.printedAt} onChange={handleChange} />
          </label>
        </div>

        <div className={styles.downloadActions}>
          <button
            type="button"
            onClick={() => downloadPdf("landscape")}
            disabled={downloadingOrientation !== null}
          >
            {downloadingOrientation === "landscape" ? "Generating Landscape PDF..." : "Download Landscape PDF"}
          </button>
          <button
            type="button"
            onClick={() => downloadPdf("portrait")}
            disabled={downloadingOrientation !== null}
          >
            {downloadingOrientation === "portrait" ? "Generating Portrait PDF..." : "Download Portrait PDF"}
          </button>
        </div>
      </section>

      <section className={styles.previewPanel}>
        <div className={styles.document} ref={documentRef}>
          <div className={styles.tearEdgeTop} />
          <div className={styles.ticketTextWrap}>
            <pre className={styles.ticketText}>{ticketText}</pre>
          </div>
          <div className={styles.tearEdgeBottom} />
        </div>
      </section>
    </div>
  );
}
