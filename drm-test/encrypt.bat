@echo off
packager ^
  in=sample.mp4,stream=video,output=out/video.m4s ^
  in=sample.mp4,stream=audio,output=out/audio.m4s ^
  --enable_raw_key_encryption ^
  --keys label=HD:key_id=7D9362C9C2FB5B538D5E50127392D700:key=02C75C5270A026A3D9BF0B4CF1541BD7,label=AUDIO:key_id=3BE9AE9CBD4424632F0909E5F205BC0D:key=F554AEDE3F84612F336D62441AD544E9 ^
  --mpd_output out/manifest.mpd
pause
