# Background
1. We need our websites to be encrypted (accessible via https).
  * The site need not be certified by a recognized CA.

# Platform

  * Apache running on Amazon EC2

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
1. Install apache.
2. Install `mod_ssl` extension <-- yum install mod_ssl
3. Install `certbot`  <-- yum install certbot
4. Install certbot's apache extension <-- yum install python-certbot-apache

Items #3 & #4 takes ~25MB of disk space.

## Setup the Website

1. Ensure apache is configured with a domain name
For e.g., add the below entry in the `/etc/httpd/conf.d/ssl.conf` file.

```
<VirtualHost _default_:80>
ServerName test.sasyasystems.com:80
</VirtualHost>
```

2. Open port 443 to enable SSL access in the target machine

3. Run `certbot`. Enter below details as prompted:
  * whether both HTTP and HTTPS should exist
    - for now `Both` option has been selected
    - you might want to change the DocumentRoot of HTTP to generic content

Certbot verifies that the host is accessible with the specified servername,
and then generates the certificate files and updates the configuration.

# Current Status
1. EC2 instance 34.244.151.117 mapped to the domain test.sasyasystems.com
using AWS route 53 service.
2. The steps described above are run on the EC2 instance.
3. The instance is now accessible via both HTTP and HTTPS.

# References

  * Certification using https://letsencrypt.org/

  * Using openSSL for securing APACHE
      - https://www.digicert.com/csr-ssl-installation/apache-openssl.htm
      - https://support.symantec.com/us/en/article.tech242030.html 
