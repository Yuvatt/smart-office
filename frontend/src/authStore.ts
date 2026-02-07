import { makeAutoObservable } from "mobx";
import { jwtDecode } from "jwt-decode";

interface UserToken {
  role: string;
  unique_name: string;
}

class AuthStore {
  token: string | null = localStorage.getItem("token");
  user: UserToken | null = null;

  constructor() {
    makeAutoObservable(this);
    if (this.token) {
      this.decodeToken();
    }
  }

  // Login 
  login = (token: string) => {
    this.token = token;
    localStorage.setItem("token", token);
    this.decodeToken();
  };

  // Logout
  logout = () => {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
  };

  // Token decoding
  private decodeToken() {
    try {
      if (this.token) {
        this.user = jwtDecode<UserToken>(this.token);
      }
    } catch (e) {
      this.logout();
    }
  }

  // Admin check
  get isAdmin() {
    return this.user?.role === "Admin";
  }

  get isAuthenticated() {
    return !!this.token;
  }
}

export const authStore = new AuthStore();