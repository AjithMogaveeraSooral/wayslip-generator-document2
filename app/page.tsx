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

const formatWeight = (value: string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  return numeric.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

const parseWeight = (value: string) => {
  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function Home() {
  const [data, setData] = useState<FormState>(initialState);
  const [downloadingOrientation, setDownloadingOrientation] = useState<PdfOrientation | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const netWeight = useMemo(() => {
    const loaded = parseWeight(data.loadedWt);
    const empty = parseWeight(data.emptyWt);
    if (loaded === null || empty === null) {
      return "";
    }

    return formatWeight(String(Math.max(loaded - empty, 0)));
  }, [data.loadedWt, data.emptyWt]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData((previous) => ({ ...previous, [name]: value }));
  };

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
          <div className={styles.ticketHeaderRow}>
            <div className={styles.headerCenter}>
              <p className={styles.title}>{data.weighbridgeName}</p>
              <p>{data.weighbridgeAddress}</p>
              <p>CAPACITY 40 TONNES</p>
              <p>TEL 1 : {data.phone} &nbsp;&nbsp; SERIAL NO.: {data.serialNo}</p>
            </div>
            <p className={styles.dateText}>DATE: {data.date}</p>
          </div>

          <div className={styles.rows}>
            <div className={styles.rowPair}>
              <p>
                <span className={styles.label}>TSNO</span>
                <span className={styles.colon}>:</span>
                <span>{data.ticketNo}</span>
              </p>
              <p>
                <span className={styles.label}>PARTY</span>
                <span className={styles.colon}>:</span>
                <span>{data.party}</span>
              </p>
            </div>
            <div className={styles.rowPair}>
              <p>
                <span className={styles.label}>VEHICLE</span>
                <span className={styles.colon}>:</span>
                <span>{data.vehicleNo}</span>
              </p>
              <p>
                <span className={styles.label}>PRODUCT</span>
                <span className={styles.colon}>:</span>
                <span>{data.product}</span>
              </p>
            </div>
            <div className={styles.weightRow}>
              <p>
                <span className={styles.label}>LOADED WT</span>
                <span className={styles.colon}>:</span>
                <span>{formatWeight(data.loadedWt)} KGS</span>
              </p>
              <p className={styles.weightMeta}>{data.printedAt}</p>
            </div>
            <div className={styles.weightRow}>
              <p>
                <span className={styles.label}>EMPTY WT</span>
                <span className={styles.colon}>:</span>
                <span>{formatWeight(data.emptyWt)} KGS</span>
              </p>
            </div>
            <div className={styles.weightRow}>
              <p>
                <span className={styles.label}>NET WT</span>
                <span className={styles.colon}>:</span>
                <span>{netWeight || "0.000"} KGS</span>
              </p>
            </div>
            <div className={styles.chargesForRow}>
              <p>
                <span className={styles.label}>CHARGES</span>
                <span className={styles.colon}>:</span>
                <span>Rs. {data.charges}</span>
              </p>
              <p>For {data.printedFor}</p>
            </div>
          </div>
          <div className={styles.tearEdgeBottom} />
        </div>
      </section>
    </div>
  );
}
