import { create } from "zustand";
import { getCookie, setCookie, clearCookie } from "./utils/cookies";
import { UserDataResponse } from "./types/auth";

interface AppStore {
  userData: Partial<UserDataResponse> | null;
  appData: UserDataResponse | null;
  menuControlData: UserDataResponse | null;
  mainMenuData: UserDataResponse | null;
  accessCode: any;
  setUserData: (userData: UserDataResponse) => void;
  setAppData: (appData: UserDataResponse) => void;
  setMenuControlData: (menuControlData: UserDataResponse) => void;
  setMainMenuData: (mainMenuData: UserDataResponse) => void;
  setAccessCode: (accessCode: string) => void;
  login: (userData: UserDataResponse) => void;
  logout: () => void;
}

const safeParseJSON = (data: any) => {
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

const appStore = create<AppStore>()((set) => ({
  userData: safeParseJSON(getCookie("flowbank_user")) || null,
  setUserData: (userData: UserDataResponse) => set({ userData }),

  appData: safeParseJSON(getCookie("flowbank_app")) || null,
  setAppData: (appData: any) => set({ appData }),

  menuControlData: safeParseJSON(getCookie("flowbank_menu")) || null,
  setMenuControlData: (menuControlData: any) => set({ menuControlData }),

  mainMenuData: safeParseJSON(getCookie("flowbank_main")) || null,
  setMainMenuData: (mainMenuData: any) => set({ mainMenuData }),

  accessCode: safeParseJSON(getCookie("flowbank_access")) || "",
  setAccessCode: (accessCode: string) => {
    set({ accessCode });

    setCookie("flowbank_access", JSON.stringify(accessCode));
  },

  login: (state) => {
    set(() => ({
      userData: state,
    }));

    const userRec = state.userRec;
    const acctCollection = state.acctCollection;
    const codProd = state.codProd;
    const companyUsers = state.companyUsers;
    const acctBlocks = state.acctBlocks;
    const menuControls = state.mmenuControls;
    const xMainMenu = state.xmainMenu;
    const pLimitsObject = state.plimitsObject;

    const appCookieData = {
      codProd,
      companyUsers,
      menuControls,
      acctBlocks,
    };

    const userCookieData = {
      userRec,
      acctCollection,
      pLimitsObject,
    };

    const mainMenuCookieData = {
      xMainMenu,
    };

    setCookie("flowbank_app", JSON.stringify(appCookieData));
    setCookie("flowbank_user", JSON.stringify(userCookieData));
    setCookie("flowbank_main", JSON.stringify(mainMenuCookieData));

    location.href = "/dashboard";
  },

  logout: () => {
    set(() => ({
      userData: null,
      appData: null,
      menuControlData: null,
      mainMenuData: null,
    }));

    clearCookie("flowbank_user");
    clearCookie("flowbank_app");

    clearCookie("flowbank_main");
    clearCookie("flowbank_features");

    location.href = "/";
  },
}));

export { appStore };
