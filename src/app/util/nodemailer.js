const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.USERNAME_EMAIL,
        pass: process.PASSWORD_EMAIL,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

var message = (data) =>  {
    const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
  
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Lobo Social</title>
    </head>
    
    <body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"
    style="margin: 0pt auto; padding: 0px; background:#F4F7FA;">
      <table id="main" width="100%" height="100%" cellpadding="0" cellspacing="0" border="0"
      bgcolor="#F4F7FA">
        <tbody>
          <tr>
            <td valign="top">
              <table class="innermain" cellpadding="0" width="580" cellspacing="0" border="0"
              bgcolor="#F4F7FA" align="center" style="margin:0 auto; table-layout: fixed;">
                <tbody>
                  <!-- START of MAIL Content -->
                  <tr>
                    <td colspan="4">
                      <!-- Logo start here -->
                      <table class="logo" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                          <tr>
                            <td colspan="2" height="30"></td>
                          </tr>
                          <tr>
                            <td valign="top" align="center">
                              <a href="#" style="display:inline-block; cursor:pointer; text-align:center;">
                                <img src="https://res.cloudinary.com/duukfyfyl/image/upload/v1649957635/lobosocial-logo-flex_naml5b.png"
                                height="32" border="0" alt="Lobo Social">
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" height="30"></td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- Logo end here -->
                      <!-- Main CONTENT -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff"
                      style="border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <tbody>
                          <tr>
                            <td height="40"></td>
                          </tr>
                          <tr style="font-family: -apple-system,BlinkMacSystemFont,&#39;Segoe UI&#39;,&#39;Roboto&#39;,&#39;Oxygen&#39;,&#39;Ubuntu&#39;,&#39;Cantarell&#39;,&#39;Fira Sans&#39;,&#39;Droid Sans&#39;,&#39;Helvetica Neue&#39;,sans-serif; color:#4E5C6E; font-size:14px; line-height:20px; margin-top:20px;">
                            <td class="content" colspan="2" valign="top" align="center" style="padding-left:90px; padding-right:90px;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="bottom" colspan="2" cellpadding="3">
                                      <img alt="Lobo" width="200" src="https://res.cloudinary.com/duukfyfyl/image/upload/v1649959320/new-messages_rvr9mm.png"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="30" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td align="center"> <span style="color:#48545d;font-size:22px;line-height: 24px;">
            X??c nh???n t??i kho???n c???a b???n
          </span>
  
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="24" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td height="1" bgcolor="#DAE1E9"></td>
                                  </tr>
                                  <tr>
                                    <td height="24" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td align="center"> <span style="color:#48545d;font-size:14px;line-height:24px;">
                                      Ch??o <span style="font-weight: bold">${data.name}</span>, ????? b???t ?????u s??? d???ng t??i kho???n Lobo, b???n c???n x??c nh???n ?????a ch??? email c???a m??nh.
          </span>
  
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="20" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td valign="top" width="48%" align="center"> 
                                        <form id="verifyform" method="POST" action="${
                                            process.env.PRODUCTION 
                                            ? 'https://lobosocial.me' 
                                            : 'http://localhost:4000'
                                        }/api/auth/verify/${data.id}?_method=PUT">
                                          
                                            <button type="submit" style="display:block; cursor: pointer; padding:15px 25px; background-color:#0c0c0d; color:#ffffff; border-radius:3px; text-decoration:none; border: none; width: 100%; font-weight: bold;">X??c nh???n ?????a ch??? Email</button>
                                          
                                        </form>
                                        
                        
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="20" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td align="center">
                                      <img src="https://s3.amazonaws.com/app-public/Coinbase-notification/hr.png" width="54"
                                      height="2" border="0">
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="20" &nbsp;=""></td>
                                  </tr>
                                  <tr>
                                    <td align="center">
                                      <p style="color:#a2a2a2; font-size:12px; line-height:17px; font-style:italic;">N???u b???n b??? qua email n??y v?? kh??ng x??c th???c t??i kho???n. T??i kho???n c???a b???n s??? b??? xo?? kh???i h??? th???ng.</p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td height="60"></td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- Main CONTENT end here -->
                      <!-- PROMO column start here -->
                      <!-- Show mobile promo 75% of the time -->
                      
                      <!-- PROMO column end here -->
                      <!-- FOOTER start here -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                          <tr>
                            <td height="10">&nbsp;</td>
                          </tr>
                          <tr>
                            <td valign="top" align="center"> <span style="font-family: -apple-system,BlinkMacSystemFont,&#39;Segoe UI&#39;,&#39;Roboto&#39;,&#39;Oxygen&#39;,&#39;Ubuntu&#39;,&#39;Cantarell&#39;,&#39;Fira Sans&#39;,&#39;Droid Sans&#39;,&#39;Helvetica Neue&#39;,sans-serif; color:#9EB0C9; font-size:10px;">&copy;
                              <a href="${
                                process.env.PRODUCTION 
                                ? 'https://lobo.today' 
                                : 'http://localhost:3000'
                              }/login" target="_blank" style="color:#9EB0C9 !important; text-decoration:none;">Lobo Social</a> 2022
                            </span>
  
                            </td>
                          </tr>
                          <tr>
                            <td height="50">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- FOOTER end here -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
    `

    return {
        from: "lobo.social.official@gmail.com",
        to: data.email,
        subject: "X??c nh???n email - Lobo Social",
        html: html
    }
};

function sendVerifyEmail (data){
    return transporter.sendMail(message(data));
}

function verifyByEmail(id){
  User.findById({_id: id})
  .then(({verified, ...data}) => {
      if(verified == false){
          User.findByIdAndUpdate({_id: id}, {verified: true}, {new: true})
          .then(res => true)
          .catch(err => console.log(err))
      }else{
          return false;
      }
  })
  .catch(err => console.log(err))
}

module.exports = {
    sendVerifyEmail,
    verifyByEmail
};