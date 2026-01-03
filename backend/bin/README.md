# FFmpeg Binary Directory

This directory should contain the static FFmpeg binary for video processing.

## Setup Instructions

1. Download FFmpeg static build from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

2. Extract and copy these files to this directory:
   - `ffmpeg.exe`
   - `ffprobe.exe` (optional, for getting video duration)

3. The final structure should be:
   ```
   backend/bin/
   ├── ffmpeg.exe
   ├── ffprobe.exe (optional)
   └── README.md
   ```

## Why Static Binary?

- No system installation required
- Portable across environments
- Production safe
- Easily version controlled

## Usage

The Study Materials module uses FFmpeg to convert uploaded videos to HLS format for secure streaming.

FFmpeg command used:
```bash
ffmpeg -i input.mp4 \
  -profile:v baseline \
  -level 3.0 \
  -start_number 0 \
  -hls_time 6 \
  -hls_list_size 0 \
  -hls_segment_filename output/segment_%03d.ts \
  -f hls output/master.m3u8
```
