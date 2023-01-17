import { LOGO_APP, URL_WEB } from "./notification";

export function MAIL_CREATE_USER(username: string, password: string) {
    return `<img src=${LOGO_APP}></img>
          <p>Estimado usuario se creado el nuevo usuario, en la app Sky Scrapper : ${username}
          \nSu contraseña es: <b> ${password}</b>
          \nPara más detalle comunicarse con el area respectiva</p>
          <br>${URL_WEB}`;
  }
  
  export function MAIL_RESET_USER(username: string, password: string) {
    return `<img src=${LOGO_APP}></img>
        <p>Estimado usuario se ha reseteado la contraseña de su usuario ${username}</p>
        <p>\nSu contraseña es la siguiente:<br> 
        <p><b> ${password} </b></p> 
        \nPara más detalle comunicarse con el area respectiva</p>
        <br>${URL_WEB}`;
  }
  