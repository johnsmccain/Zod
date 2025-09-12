import User from "../Model/user";
import Account from "../Model/account";
import Token from "../Model/token";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const signToken = (id: string) => {
  const secret: Secret = (process.env.JWT_SECRET || "dev_secret_change_me") as Secret;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ id }, secret, { expiresIn });
};

export const createSendToken = (user: InstanceType<typeof User>, statusCode: number,req: Request, res: Response) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  const sanitized = user.toObject ? user.toObject() : { ...user } as any;
  delete (sanitized as any).password;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: sanitized,
    },
  });
};

export const signUp = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, passwordConfirm, address, private_Key, mnemonic } = req.body;
  User.create({ name, email, password, passwordConfirm, address, private_Key, mnemonic })
    .then((user) => {
      Account.create({ user: user.id });
      createSendToken(user, 201, req, res);
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err.message,
      });
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password!",
    });
  }
  User.findOne({ email }).select("+password").then((user) => {
    if (!user || !(user as any).correctPassword(password, user.password)) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    createSendToken(user, 200, req, res);
  });
}; 

export const allToken = async (req: Request, res: Response, next: NextFunction) => {
  const tokens = await Token.find();
  res.status(200).json({
    status: "success",
    results: tokens.length,
    data: {
      tokens,
    },
  });
};

export const addToken = async (req: Request, res: Response, next: NextFunction) => {
  const { name, address, symbol } = req.body;
  const newToken = await Token.create({ name, address, symbol });
  res.status(201).json({
    status: "success",
    data: {
      token: newToken,
    },
  });
};

export const allAccount = async (req: Request, res: Response, next: NextFunction) => {
  const accounts = await Account.find();
  res.status(200).json({
    status: "success",
    results: accounts.length,
    data: {
      accounts,
    },
  });
};

export const createAccount = async(req: Request, res: Response, next: NextFunction) => {
  const { privateKey, address } = req.body;
  const newAccount = await Account.create({ privateKey, address });
  res.status(201).json({
    status: "success",
    data: {
      account: newAccount,
    },
  }); 
};