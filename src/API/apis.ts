import axios from "axios";
import { Cookies } from "react-cookie";

export const getAccessToken = () => {
  const cookie = new Cookies();
  return cookie.get("accessToken");
};

const ACCESSTOKEN = getAccessToken();

export const ApiHttp = axios.create({
  baseURL: "/mini",
  headers: {
    Authorization: `Bearer ${ACCESSTOKEN}`
  }
});

export const ApiLogin = axios.create({
  baseURL: "/mini"
});

// NEW_ACCESSTOKEN (리프레시 토큰 요청 => 새로운 엑세스 토큰 반환)
export const getNewAccessToken = async () => {
  try {
    const response = await ApiHttp.post(
      "/api/token",
      {},
      {
        headers: {
          Authorization: `Bearer ${ACCESSTOKEN}`
        },
        withCredentials: true
      }
    );
    const newAccessToken = response.data.accessToken;
    return newAccessToken;
  } catch (error) {
    console.error("getNewAccessTokenAPI에러: ", error);
    throw error;
  }
};

// ADMIN_PAGE
export const getListAll = async () => {
  try {
    const res = await ApiHttp.get("/api/admin", {
      headers: {
        Authorization: `Bearer ${ACCESSTOKEN.accessToken}`
      }
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// ADMIN_연차/당직 승인 처리
export const permission = async () => {
  try {
    const res = await ApiHttp.post("/api/admin/apply", {}, {
      headers: {
        Authorization: `Bearer ${ACCESSTOKEN}`
      }
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// GET_MY_PAGE
export const getMyPage = async () => {
  try {
    const res = await ApiHttp.get("/api/user");
    return res.data;
  } catch (error: any) {
    console.error("getMyPage API에러: ", error);
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.log("새 토큰 보내고 정보 받아오는 중");
      try {
        const NEW_ACCESSTOKEN = await getNewAccessToken();
        const config = error.config;
        config.headers.Authorization = `Bearer ${NEW_ACCESSTOKEN}`;
        document.cookie = `accessToken=${NEW_ACCESSTOKEN}; path=/; `;
        const res = await ApiHttp.get(config.url, config);
        return res.data;
      } catch (error) {
        console.log("재요청에러: ", error);
      }
    } else {
      throw error;
    }
  }
};


// LOG_IN
export const login = async (email: string, password: string) => {
  try {
    return await ApiLogin.post(
      "/api/login",
      {
        email,
        password
      },
      { withCredentials: true }
    );
  } catch (error) {
    console.log("login Api 호출 : ", error);
  }
};

// LOG_OUT
export async function logOut() {
  try {
    const res = await ApiHttp.post("/api/logout");
    return res;
  } catch (error) {
    console.error("로그아웃이 실패 하였습니다.", error);
  }
}

// SIGN_UP
export const signUp = async (
  email: string,
  password: string,
  name: string,
  join: string
) => {
  try {
    const response = await ApiLogin.post("/api/register", {
      email,
      password,
      name,
      join
    });
    return response.data;
  } catch (error) {
    console.log("signupAPI호출 :", error);
  }
};

// GET_MAIN_PAGE
export const getMainPage = () => {
  try {
    const response = ApiHttp.get("/api/main", {
      headers: {
        Authorization: `Bearer ${ACCESSTOKEN}`
      }
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export async function postMain(data: NewEvent) {
  try {
    await ApiHttp.post("/api/annual", { data }).then((res) => {
      console.log("새로운 등록 완료", res.data);
      return res.data;
    });
  } catch (error) {
    console.error("Error submitting event:", error);
  }
}

export async function postUpdate(data: UpdateType) {
  try {
    await ApiHttp.post("/api/annual/update", data)
      .then((res) => {
        console.log("수정 완료", res);
        return res;
      });
  } catch (error) {
    console.error("Error submitting event:", error);
  }
}
export async function postDelete(id:number) {
  try {
    await ApiHttp.post("/api/annual/cancel", {id})
     .then((res) => {
        console.log("삭제 완료", res);
        return res;
      });
  } catch (error) {
    console.error("Error submitting event:", error);
  }
}

export async function postPassword(data:{newPassword:string}) {
  try {
    const response = await ApiHttp.post("/api/user", data);
    console.log("비밀번호 변경 완료", response);
    return response.data; // 변경된 정보 등 필요한 데이터 반환
  } catch (error) {
    console.error("패스워드 변경 실패:", error);
    throw error;
  }
}
