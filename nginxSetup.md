This documents essential setup being done on nginx, for repeatability.

# SSL Enabling

Refer to [./EnablingSSL.md] for SSL enabling.

# Services Mapping

At this time, the architecture is based on the following assumptions:
  * All services are hosted on the same machine (EC2 instance).
    Thus, a service calls another service by using localhost:port as the
    endpoint.
  * Services are accessed from external entities (browser etc.) via the
    nginx gateway. The nginx server acts as a proxy to all the services.
  * Services may be hosted in the same machine as nginx, or on a different
    machine.

```
                               service1
browser <==> nginx server <==> service2
                               service3
```

All mappings are moved out to a separate sasya.conf file (which is included in
the main conf file). It is located as `/home/ec2-user/.redirect/sasya.conf`.
Excerpt from the mapping is:
```
location /api/mqttService/ {
  rewrite /api/mqttService/(.*) /$1  break;
  proxy_pass         http://localhost:3990;
  proxy_redirect     off;
  proxy_set_header   Host $host;
}

location /api/onDemandService/ {
  rewrite /api/onDemandService/(.*) /$1  break;
  proxy_pass         http://localhost:3992;
  proxy_redirect     off;
  proxy_set_header   Host $host;
}
```
All APIs are mapped under `/api/<apiname>` and are further redirected to the
service running on the same machine and the given port number.
> This is to be cleaned up and tested.

# TODO

Passing authentication details across services.

# References
  * introduction on proxy: https://www.keycdn.com/support/nginx-reverse-proxy
  * advanced nginx modules: https://github.com/openresty/set-misc-nginx-module
  * on hardwired proxy authentication: http://shairosenfeld.blogspot.com/search?q=nginx
  * nginx proxy module: http://nginx.org/en/docs/http/ngx_http_proxy_module.html
documentation
  * nginx configuration advanced: https://support.hypernode.com/knowledgebase/create-reusable-config-for-custom-snippets/
