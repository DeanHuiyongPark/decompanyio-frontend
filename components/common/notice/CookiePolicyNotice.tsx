import React, { useEffect, useState } from "react";
import common_view from "common/common_view";
import { psString } from "utils/localization";
import * as styles from "public/static/styles/main.scss";

export default function() {
  const [cookiePolicyValue, setCookiePolicyValue] = useState(false);

  // 모달 실행 시
  const getStarted = () => {
    common_view.setCookie("cpv", true, 1000);
    setCookiePolicyValue(true);
  };

  useEffect(() => {
    let _cookiePolicyValue = common_view.getCookie("cpv");
    if (!_cookiePolicyValue) {
      common_view.setCookie("cpv", false, 1000);
      setCookiePolicyValue(false);
    } else if (_cookiePolicyValue === "true") {
      setCookiePolicyValue(true);
    }
  });

  if (cookiePolicyValue) return <div />;
  else {
    return (
      <div className={styles.cpn_wrapper}>
        <div className={styles.cpn_container}>
          <div className={styles.cpn_text}>
            {psString("cookie-policy-content")}
          </div>

          <div className={styles.cpn_btn} onClick={() => getStarted()}>
            Accept
          </div>
        </div>
        <div className={styles.cpn_dummy} />
      </div>
    );
  }
}
