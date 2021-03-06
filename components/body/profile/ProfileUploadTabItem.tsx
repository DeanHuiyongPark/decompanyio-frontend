import React, { useEffect, useState } from "react";
import { FadingCircle } from "better-react-spinkit";
import * as styles from "../../../public/static/styles/main.scss";
import { useSelector, useDispatch } from "react-redux";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC";
import common_view from "common/common_view";
import { psString } from "utils/localization";
import common from "common/common";
import { APP_CONFIG } from "../../../app.config";
import Link from "next/link";
import repos from "../../../utils/repos";
import { AUTH_APIS } from "../../../utils/auth";
import RewardCard from "../../common/card/RewardCard";
import { setActionMain } from "../../../redux/reducer/main";
import DocumentInfo from "../../../service/model/DocumentInfo";

type Type = {
  documentData: any;
  idx: number;
  handleUploadSettings: any;
  viewerOptionOpenedIdx: any;
  owner: boolean;
};

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

export default function({
  documentData,
  idx,
  handleUploadSettings,
  viewerOptionOpenedIdx,
  owner
}: Type) {
  const dispatch = useDispatch();
  const myInfo = useSelector(state => state.main.myInfo);
  const isMobile = useSelector(state => state.main.isMobile);
  const [tmpDocumentData, setTmpDocumentData] = useState(
    new DocumentInfo(null)
  );
  const [rewardInfoOpen, setRewardInfo] = useState(false);

  // 문서 다운로드
  const getContentDownload = (documentId: string, documentName: string) =>
    repos.Document.getDocumentDownloadUrl({ documentId: documentId })
      .then(result => {
        const a = document.createElement("a");

        a.style.display = "none";
        document.body.appendChild(a);
        a.href = result.downloadUrl;
        a.setAttribute("download", documentName);
        a.click();

        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
      })
      .catch(err => console.error(err));

  // 문서 정보 state 저장
  const setDocumentToState = () => {
    return new Promise(resolve => {
      if (!tmpDocumentData.seoTitle) {
        resolve(setTmpDocumentData(documentData));
      } else {
        resolve();
      }
    });
  };

  // document state 관리
  const setDocumentState = state => {
    let _tmpDocumentData = state.tmpDocumentData;
    _tmpDocumentData.state = state;
    setTmpDocumentData(_tmpDocumentData);
  };

  // 문서 다운로드 전 데이터 SET
  const handleDownloadContent = () => {
    if (!tmpDocumentData) {
      return dispatch(setActionMain.alertCode(2091, {}));
    }
    if (!AUTH_APIS.isAuthenticated() && !myInfo.email) {
      return dispatch(setActionMain.alertCode(2003, {}));
    }

    const documentId = tmpDocumentData.documentId;
    const documentName = tmpDocumentData.documentName;

    return getContentDownload(documentId, documentName);
  };

  // 문서 상태관리
  const handleState = () => {
    if (
      !owner ||
      !tmpDocumentData.state ||
      tmpDocumentData.state === "CONVERT_COMPLETE"
    ) {
      return false;
    }

    let interval = setInterval(() => {
      repos.Document.getDocument(tmpDocumentData.seoTitle)
        .then(res => {
          if (res && res.document.state === "CONVERT_COMPLETE") {
            clearInterval(interval);
            setDocumentState(res.document.state);
            dispatch(
              setActionMain.alertCode(2075, { title: tmpDocumentData.title })
            );
          }
        })
        .catch(() => {
          clearInterval(interval);
          dispatch(setActionMain.alertCode(2001, {}));
        });
    }, 5000);
  };

  // 공유 버튼 클릭
  const handleClickShareBtn = () =>
    dispatch(setActionMain.modal("share", { documentData }));

  // 삭제 버튼 클릭
  const handleClickDeleteBtn = () =>
    dispatch(setActionMain.modal("delete", { documentData }));

  // 출판 버튼 클릭
  const handleClickPublishBtn = () =>
    dispatch(setActionMain.modal("publish", { documentData }));

  useEffect(() => {
    setDocumentToState().then(() => handleState());
  }, []);

  let reward = common.toEther(0);
  const vote = common.toEther(tmpDocumentData.latestVoteAmount) || 0;
  let view = tmpDocumentData.latestPageview || 0;
  let identification = tmpDocumentData.author
    ? tmpDocumentData.author.username &&
      tmpDocumentData.author.username.length > 0
      ? tmpDocumentData.author.username
      : tmpDocumentData.author.email
    : tmpDocumentData.accountId;

  return (
    <div className={styles.puti_container}>
      <div className={styles.puti_thumbWrapper}>
        <div className={styles.puti_thumb}>
          {tmpDocumentData.state &&
          tmpDocumentData.state !== "CONVERT_COMPLETE" ? (
            <p data-tip="Converting document...">
              <div className={styles.puti_notConvertContainer}>
                <div className={styles.puti_notConvert}>
                  <FadingCircle size={40} color={"#3d5afe"} />
                </div>
              </div>
            </p>
          ) : (
            <Link
              href={{
                pathname: "/contents_view",
                query: { seoTitle: documentData.seoTitle }
              }}
              as={"/@" + identification + "/" + documentData.seoTitle}
            >
              <img
                src={common.getThumbnail(
                  tmpDocumentData.documentId,
                  isMobile ? 640 : 320,
                  1,
                  tmpDocumentData.documentName
                )}
                alt={
                  tmpDocumentData.title
                    ? tmpDocumentData.title
                    : tmpDocumentData.documentName
                }
                className={
                  styles.puti_cardImg +
                  " " +
                  (tmpDocumentData.state &&
                  tmpDocumentData.state !== "CONVERT_COMPLETE"
                    ? styles.puti_notConvertBackground
                    : "")
                }
              />
            </Link>
          )}
        </div>
      </div>

      <div className={styles.puti_optionBtnWrapper}>
        {owner && (
          <div className={styles.puti_optionBtn}>
            <i
              className={
                "material-icons " +
                (viewerOptionOpenedIdx === idx ? styles.puti_optionShow : "")
              }
              onClick={() => handleUploadSettings()}
            >
              more_vert
            </i>

            <div
              className={
                styles[
                  "puti_optionTable" +
                    (viewerOptionOpenedIdx === idx ? "" : "Hide")
                ]
              }
              id={"optionTable" + idx}
            >
              <div
                className={styles.puti_optionTableBtn}
                onClick={() => handleClickShareBtn()}
              >
                <i className="material-icons">share</i>
                {psString("share-modal-btn")}
              </div>
              {tmpDocumentData.state === "CONVERT_COMPLETE" && (
                <div
                  className={styles.puti_optionTableBtn}
                  onClick={() => handleDownloadContent()}
                >
                  <i className="material-icons">save_alt</i>
                  {psString("download-btn")}
                </div>
              )}

              {((common.dateAgo(tmpDocumentData.created) > 0 &&
                tmpDocumentData.state &&
                tmpDocumentData.state !== "CONVERT_COMPLETE") ||
                !tmpDocumentData.isPublic) && (
                <div
                  className={styles.puti_optionTableBtn}
                  onClick={() => handleClickDeleteBtn()}
                >
                  <i className="material-icons">delete</i>
                  {psString("common-modal-delete")}
                </div>
              )}
            </div>
          </div>
        )}
        <Link
          href={{
            pathname: "/contents_view",
            query: { seoTitle: documentData.seoTitle }
          }}
          as={"/@" + identification + "/" + documentData.seoTitle}
        >
          <div
            className={
              tmpDocumentData.state &&
              tmpDocumentData.state !== "CONVERT_COMPLETE"
                ? " not-convert-wrapper"
                : ""
            }
          >
            <div
              className={styles.puti_title}
              onClick={() => common_view.scrollTop()}
            >
              {tmpDocumentData.title
                ? tmpDocumentData.title
                : tmpDocumentData.documentName}
            </div>
          </div>
        </Link>

        <div className={styles.puti_descWrapper}>
          {tmpDocumentData.desc &&
            tmpDocumentData.state === "CONVERT_COMPLETE" && (
              <Link
                href={{
                  pathname: "/contents_view",
                  query: { seoTitle: documentData.seoTitle }
                }}
                as={"/@" + identification + "/" + documentData.seoTitle}
              >
                <div className={styles.puti_desc}>
                  <ResponsiveEllipsis
                    text={tmpDocumentData.desc}
                    maxLine={2}
                    ellipsis="..."
                    trimRight
                    basedOn="words"
                  />
                </div>
              </Link>
            )}
        </div>

        <div className={styles.puti_infoWrapper}>
          <span
            className={styles.puti_reward}
            onMouseOver={() => setRewardInfo(true)}
            onMouseOut={() => setRewardInfo(false)}
          >
            $ {common.deckToDollar(reward)}
            <img
              className={styles.puti_arrow}
              src={
                APP_CONFIG.domain().static + "/image/icon/i_arrow_down_blue.svg"
              }
              alt="arrow button"
            />
          </span>

          {reward > 0 && rewardInfoOpen && (
            <RewardCard reward={reward} documentData={tmpDocumentData} />
          )}
          <span className={styles.puti_view}>{view}</span>
          <span className={styles.puti_vote}>{common.deckStr(vote)}</span>
          <div className={styles.puti_date}>
            {common_view.dateTimeAgo(tmpDocumentData.created, isMobile)}
          </div>

          {/*          <div
            className={
              "claim-btn-wrapper " + (isMobile ? "mt-2" : "float-right")
            }
          >
            <CreatorClaimContainer {...props} document={tmpDocumentData} />
          </div>*/}

          {!tmpDocumentData.isPublic &&
            tmpDocumentData.state === "CONVERT_COMPLETE" && (
              <div className={styles.puti_publishBtnWrapper}>
                <p
                  data-tip={psString("tooltip-publish")}
                  className={styles.puti_publishBtn}
                  onClick={() => handleClickPublishBtn()}
                >
                  {psString("common-modal-publish")}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
