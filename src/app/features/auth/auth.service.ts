import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    http = inject(HttpClient);

    login(obj: any) {
        this.http.get(environment.API_URL)
    }
}