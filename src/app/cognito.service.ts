import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Amplify, { Auth } from 'aws-amplify';

import { environment } from '../environments/environment';

export interface IUser {
  username: string;
  email: string;
  password: string;
  showPassword: boolean;
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CognitoService {

  readonly ACCESS_TOKEN_ID = 'access_token';
  private storage: Storage = localStorage;
  private authenticationSubject: BehaviorSubject<any>;

  constructor() {
    Amplify.configure({
      Auth: environment.cognito,
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);
  }

  public signUp(user: IUser): Promise<any> {
    return Auth.signUp({
      username: user.username,
      password: user.password,
      attributes: {
        email: user.email
      }
    });
  }

  public confirmSignUp(user: IUser): Promise<any> {
    return Auth.confirmSignUp(user.username, user.code);
  }

  public signIn(user: IUser): Promise<any> {
    return Auth.signIn(user.username, user.password)
    .then(() => {
      Auth.currentSession().then(session => {
        this.storage.setItem(this.ACCESS_TOKEN_ID, session.getAccessToken().getJwtToken())
        this.authenticationSubject.next(true);
      })
    });
  }

  public signOut(): Promise<any> {
    return Auth.signOut()
    .then(() => {
      this.authenticationSubject.next(false);
    });
  }

  public isAuthenticated(): BehaviorSubject<boolean> {
    return this.authenticationSubject
  }

  public getUser(): Promise<any> {
    return Auth.currentUserInfo();
  }

  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser()
    .then((cognitoUser: any) => {
      return Auth.updateUserAttributes(cognitoUser, user);
    });
  }

  public getAccessToken(): string | null {
    return this.storage.getItem(this.ACCESS_TOKEN_ID);
  }

}
