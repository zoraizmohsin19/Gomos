# Background
  * We need our websites to be encrypted (accessible via https).
    - The site need not be certified by a recognized CA.

# Platform

  Either of:
  * Apache running on Amazon EC2
  * nginx running on Amazon EC2

# Options Tried
  
  * Self certification using openSSL
    - openssl is available in the EC2 instance
    - certificates are generated using openssl
    - The files (a key file and a crt file) are added to the Apache
      configuration

      > The certificates are self-signed using openssl, and has less legitimacy.

  * Certification using https://letsencrypt.org/
    - This is recommended primarily because its primary intent is to provide a
      free route for an encrypted web, which matches with our needs.
    - We have used `certbot` option, as in https://letsencrypt.org/docs/client-options/

# Steps for Setting Up

All the below commands should be run under `sudo`.

## Install New Software
1. Install apache or nginx.
2. Install `mod_ssl` extension <-- yum install mod_ssl
3. Install `certbot`  <-- yum install certbot
4. Install certbot's apache/nginx extension <-- yum install python-certbot-apache or python-certbot-nginx

Items #3 & #4 takes ~25MB of disk space.

## Setup the Website

1. Ensure apache/nginx is configured with a domain name
For e.g., add the below entry in the `/etc/httpd/conf.d/ssl.conf` file.

For apache:
```
<VirtualHost _default_:80>
ServerName test.sasyasystems.com:80
</VirtualHost>
```

For nginx:
```
    server {
        server_name  test.sasyasystems.com;
        ...
    }
```

2. Open port 443 to enable SSL access in the target machine

3. Run `certbot`. Enter below details as prompted:

  * whether both HTTP and HTTPS should exist
    - for apache, now `Both` option has been selected
      - you might want to change the DocumentRoot of HTTP to generic content
    - for nginx, HTTP has been redirected to HTTPS.
```
    server {
    if ($host = test.sasyasystems.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  test.sasyasystems.com;
    return 404; # managed by Certbot
}
```

Certbot verifies that the host is accessible with the specified servername,
and then generates the certificate files and updates the configuration.

# Current Status
1. Mapped EC2 instance 34.244.151.117 to the domain test.sasyasystems.com
using AWS route 53 service. <-- by Takreem
  > Presumes static addressing.
2. Setup the apache SSL on the EC2 instance, as per the steps described above.
   Installed and setup nginx.
  * Currently, nginx is running. Yet to determine what happens on reboot.
3. The instance is now accessible via both HTTP and HTTPS.

## TODOs
  * For apache, HTTP access is still there. This might have to be modified.
    - Change the DocumentRoot to harmless static content, or...
    - Redirect HTTP traffic automatically to HTTPS.
      - https://www.namecheap.com/support/knowledgebase/article.aspx/9821/38/apache-redirect-to-https has information on redirection
```
<VirtualHost *:80>
ServerName test.sasyasystems.com
Redirect permanent / https://test.sasyasystems.com/
</VirtualHost>

<VirtualHost _default_:443>
ServerName test.sasyasystems.com
DocumentRoot ...
SSLEngine On
...
</VirtualHost>
```

  * For nginx, HTTP is redirected to HTTPS. If HTTP should also be there, need
    to change the configuration.


  * Mapping the node based services and content to nginx/apache.
    > Now that nginx is up, we will focus only on nginx.
      Apache remain available in a stopped state on EC2.

# References

  * Certification using https://letsencrypt.org/

  * Using openSSL for securing APACHE
      - https://www.digicert.com/csr-ssl-installation/apache-openssl.htm
      - https://support.symantec.com/us/en/article.tech242030.html 
