import * as styles from "public/static/styles/main.scss";
import { useSelector } from "react-redux";
import { APP_CONFIG } from "../../../app.config";
import common from "common/common";
import Link from "next/link";
import UserAvatar from "../../common/avatar/UserAvatar";
import RewardCard from "components/common/card/RewardCard";
import { AUTH_APIS } from "../../../utils/auth";
import React from "react";
import ViewOption from "./ViewOption";

type Type = {
  documentData: any;
};

// 리워드 정보 표시
const showRewardInfo = id => {
  if (document.getElementById(id)) {
    document.getElementById(id)!.style.display = "block";
  }
};

// 리워드 정보 숨김
const hideRewardInfo = id => {
  if (document.getElementById(id)) {
    document.getElementById(id)!.style.display = "none";
  }
};

// 기본 data set
const setData = (documentData: any) => {
  let vote: number;
  let reward: number;
  let view: number;
  let accountId: string;
  let profileUrl: string;
  let croppedArea: any;
  let identification: string;

  vote = common.toEther(documentData.latestVoteAmount) || 0;
  reward = common.toEther(0);
  view = documentData.latestPageview || 0;
  accountId = documentData.accountId || "";
  profileUrl = documentData.author ? documentData.author.picture : null;
  croppedArea = documentData.author ? documentData.author.croppedArea : null;
  identification = documentData.author
    ? documentData.author.username && documentData.author.username.length > 0
      ? documentData.author.username
      : documentData.author.email
    : documentData.accountId;

  return {
    vote,
    reward,
    view,
    accountId,
    profileUrl,
    croppedArea,
    identification
  };
};

export default function({ documentData }: Type) {
  const myInfoFromRedux = useSelector(state => state.main.myInfo);
  const {
    vote,
    reward,
    view,
    profileUrl,
    croppedArea,
    identification
  } = setData(documentData);

  return (
    <div className={styles.vib_container}>
      <div className={styles.vib_title}>{documentData.title}</div>

      <div className={styles.vib_infoContainer}>
        <div className={styles.vib_info_1}>
          <Link
            href={{
              pathname: "/my_page",
              query: { identification: identification }
            }}
            as={"/@" + identification}
          >
            <div>
              <UserAvatar
                picture={profileUrl}
                croppedArea={croppedArea}
                size={43}
              />
            </div>
          </Link>

          <div className={styles.vib_infoIdWrapper}>
            <Link
              href={{
                pathname: "/my_page",
                query: { identification: identification }
              }}
              as={"/@" + identification}
            >
              <div className={styles.vib_infoId}>{identification}</div>
            </Link>
            <div className={styles.vib_date}>
              {common.timestampToDate(documentData.created)}
            </div>
          </div>
        </div>

        <div className={styles.vib_info_2}>
          <span
            className={styles.vib_reward}
            onMouseOver={() => showRewardInfo(documentData.seoTitle + "reward")}
            onMouseOut={() => hideRewardInfo(documentData.seoTitle + "reward")}
          >
            $ {common.deckToDollar(reward)}
            <img
              className={styles.vib_rewardArrow}
              src={
                APP_CONFIG.domain().static + "/image/icon/i_arrow_down_blue.svg"
              }
              alt="arrow button"
            />
          </span>
          {reward > 0 && (
            <RewardCard reward={reward} documentData={documentData} />
          )}
          <span className={styles.vib_view}>{view}</span>
          <span className={styles.vib_vote}>{common.deckStr(vote)}</span>
          {AUTH_APIS.isAuthenticated() &&
            documentData.author.sub === myInfoFromRedux.sub && (
              <ViewOption documentData={documentData} />
            )}
        </div>
      </div>
    </div>
  );
}
