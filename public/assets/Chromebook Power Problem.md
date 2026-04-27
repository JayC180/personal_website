I have a Chromebook that's been flashed to run NixOS. The internal eMMC isn't large enough, so I put `/nix` on an SD card. One day I took it out to do some work, and it failed at stage 1 with an error message about filesystem corruption on the SD card, saying a check was forced. I was outside and didn't have a bootable USB with me. Since essentially all binaries live in `/nix`, I couldn't get a TTY or enter emergency mode in any meaningful way. I tried adding flags to the GRUB configuration to break before the mount point (with `rd.break`), but that didn't work. Removing and reinserting the SD card didn't help either.

Then, during yet another hopeless reboot, the laptop died. I was confused because I had charged it overnight. I quickly realized that the Chromebook firmware has a design where opening the lid triggers a power-on, with no way to disable it. The laptop probably booted itself inside my bag, drained the battery completely, and caused the filesystem corruption in the process. After letting it charge for a bit, it booted again. It hung at stage 1 for a while, then unexpectedly proceeded to stage 2, and finally a full boot. Once I got in, I ran `nix-store --verify --check-contents` and everything was clean. I also ran `touch /forcefsck` then rebooted; it was fine. The corruption was transient, likely caused entirely by the abrupt power loss. The real issue is the firmware behavior: accidental boots from lid events leading to battery drain and filesystem damage during improper shutdown.

So I added a simple safeguard: a systemd service that waits three minutes after boot, checks if anyone is logged in via `loginctl list-sessions --no-legend`, and if no sessions exist, performs a clean shutdown. I am the only user on this machine, so I only have to check for my username and root (although I have never booted as root). I also never run this machine headlessly, so this effectively means that if the laptop boots itself in my bag and I don't actually use it, it will turn itself off after three minutes instead of sitting there until the battery dies. Here is the service definition:

```nix
systemd.services.boot-check-shutdown = {
  description = "Shutdown if system unused shortly after boot";
  wantedBy = [ "multi-user.target"];
  after = [ "multi-user.target" "systemd-logind.service" ];
  requires = [ "systemd-logind.service" ];
  serviceConfig = {
    Type = "oneshot";
    ExecStart = pkgs.writeShellScript "boot-check-shutdown" ''
      sleep 180
      if ! loginctl list-sessions --no-legend | grep -qE "root|username"; then
        sync
        systemctl poweroff
      fi
    '';
  };
};
```
