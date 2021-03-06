import * as styles from "../../../public/static/styles/main.scss";
import LinesEllipsis from "react-lines-ellipsis";
import { APP_CONFIG } from "../../../app.config";
import common from "../../../common/common";
import Link from "next/link";
import React, { useState } from "react";

type Type = {
  mapData: any;
  documentData: any;
  text: any;
};

// 정렬 시간 GET
const getSortedTime = result => {
  result.viewTracking.sort((a, b) => a.t - b.t);
  return common.timestampToTime(result.viewTracking[0].t);
};

// 머문 시간 GET
const getStayingTime = result => {
  result.viewTracking.sort((a, b) => a.t - b.t);
  let nextDt = result.viewTracking[result.viewTracking.length - 1].t;
  let prevDt = result.viewTracking[0].t;
  let rstTime = common.timestampToDurationJustTime(nextDt - prevDt);
  return rstTime === "0s " ? "" : "( " + rstTime + ")";
};

export default function({ mapData, documentData, text }: Type) {
  const [folded, setFolded] = useState(-1);

  // 이미지 URL GET
  const getImgUrl = page =>
    common.getThumbnail(documentData.documentId, 320, page, "");

  let identification = documentData.author
    ? documentData.author.username && documentData.author.username.length > 0
      ? documentData.author.username
      : documentData.author.email
    : documentData.accountId;

  return (
    <li>
      <div
        onClick={() => setFolded(folded === 1 ? 0 : 1)}
        className={styles["tdi_title" + (folded === 1 ? "On" : "")]}
      >
        <i>
          <img
            src={APP_CONFIG.domain().static + "/image/icon/i_faq.png"}
            alt="dropdown icon"
          />
        </i>
        <div className={styles.tdi_time}>
          {getSortedTime(mapData)}
          <span>{getStayingTime(mapData)}</span>
        </div>
      </div>
      <div
        className={
          styles[
            "tdi_desc" +
              (folded === -1 ? "None" : folded === 1 ? "ScrollOut" : "ScrollUp")
          ]
        }
      >
        <dl>
          {mapData.viewTracking
            .sort((a, b) => a.t - b.t)
            .map((_result: any, idx) => (
              <dd key={idx}>
                <div className={styles.tdi_innerContainer}>
                  <span
                    className={styles.tdi_innerTime}
                    title={common.timestampToTime(_result.t)}
                  >
                    {common.timestampToTime(_result.t)}
                  </span>

                  {_result.ev === "leave" && (
                    <div className={styles.tdi_innerStatusWrapper}>
                      <span className={styles.tdi_innerStatus}>
                        {_result.ev}
                      </span>
                    </div>
                  )}
                  {_result.ev !== "leave" && (
                    <div className={styles.tdi_innerInfoBtnWrapper}>
                      <p
                        className={styles.tdi_innerInfoBtn}
                        data-html={true}
                        data-tip={
                          "<img src='" +
                          getImgUrl(_result.n) +
                          "' alt='thumbnail' className='" +
                          styles.tdi_tooltipImg +
                          "' />"
                        }
                      >
                        <span className={styles.tdi_infoBtn}> {_result.n}</span>
                      </p>
                    </div>
                  )}

                  {_result.ev !== "leave" && (
                    <div className={styles.tdi_link}>
                      {text && (
                        <Link
                          href={{
                            pathname: "/contents_view",
                            query: { seoTitle: documentData.seoTitle }
                          }}
                          as={
                            "/@" + identification + "/" + documentData.seoTitle
                          }
                        >
                          <LinesEllipsis
                            text={
                              <span className={styles.tdi_text}>
                                {text[_result.n - 1]}
                              </span>
                            }
                            maxLine="1"
                            ellipsis="..."
                            trimRight
                            basedOn="letters"
                            className="d-none d-sm-block w-100"
                          />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </dd>
            ))}
        </dl>
      </div>
    </li>
  );
}
