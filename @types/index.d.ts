declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      _as: string;
      name: string;
      email: string;
      iat: number;
      exp: number;
    };
  }
}
