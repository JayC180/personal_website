When I moved into a new apartment, I realized that the whole place uses one single network, with client isolation enabled--my devices couldn't ping each other directly through LAN. I guess this makes sense, as it could be easier to manage for the property and might be reasonably safe if configured well, but this is kinda problematic for home labs. 

I use Tailscale to connect my devices, so that's a good workaround for some things. But the challenge came when I tried to set up a new Proxmox server on a spare computer my friend gave me. The bad news: there's no ethernet connection in the apartment, and Proxmox doesn't support doing things via WiFi. After done installation, there's no network manager, no wpa supplicant, no iwd. I am unable to connect to the internet at all.

Thank to the website [pkgs.org](https://pkgs.org), I am able to download the `.deb` packages for wpa supplicant and its dependencies onto my USB, which I can use to transfer the files to my Proxmox server. Then, I had to reconfigure my `/etc/network/interfaces` file, so that it stops trying to use ethernet and uses the wireless NIC for the network bridge.

`cat /etc/network/interfaces`
```
auto lo
iface lo inet loopback

auto wlp6s0
iface wlp6s0 inet dhcp
    wpa-ssid "<SSID>"
    wpa-psk "<PASSWORD>"
    pre-up ip link set wlp6s0 up

auto vmbr0
iface vmbr0 inet static
    address 192.168.100.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    post-up   echo 1 > /proc/sys/net/ipv4/ip_forward
    post-up   iptables -t nat -A POSTROUTING -s '192.168.100.0/24' -o wlp6s0 -j MASQUERADE
    post-down iptables -t nat -D POSTROUTING -s '192.168.100.0/24' -o wlp6s0 -j MASQUERADE
```

By restarting the wireless NIC, I am able to get internet. But one more thing: I need DHCP service, as now Proxmox serves as the gateway for my VMs rather than the apartment's switch. So I am using `dnsmasq` to act as the DHCP server with the following configs:

`cat /etc/dnsmasq.d/vmbr0.conf `
```
interface=vmbr0
dhcp-range=192.168.100.50,192.168.100.150,12h
```

And there it is, I can then configure my VMs as normal.