import { ffmpeg, FfmpegClass } from "https://github.com/laltin/deno-ffmpeg/raw/main/mod.ts";

const open = async (input_path) => new VideoFile(input_path);
class VideoFile {
    constructor(input) {
        this.inst = this.create_ffmpeg(input);
    }

    create_ffmpeg(input) {
        return ffmpeg({ ffmpegDir: "~\\bin\\ffmpeg.exe" }).addInput(input);
    }

    /**
     * @param {(ff: FfmpegClass) => any} modifier
     * @returns this
     */
    async apply(modifier) {
        modifier(this.inst);

        const data = await this.inst.save('pipe:1', false, { f: 'mpegts' });
        this.inst = this.create_ffmpeg(data);

        return this;
    }
    
    async save_to(output_path) {
        return this.inst.save(output_path);
    }
}

//#region common filters
const filter_faster = (multiplier) => {
    return {
        options: {
            setpts: (1/multiplier) + "*PTS",
        }
    }
}
const filter_pad = (width, height, x, y, color) => {
    return {
        filterName: 'pad',
        options: {
            width,
            height,
            x,
            y,
            color,
        }
    }

}
const filter_crop = () => {

}
//#endregion

await open(Deno.args[0])
    .then(vf => vf.apply(ff => {
        ff.videoFilters(filter_faster(4));
    }))
    .then(vf => vf.apply(ff => {
        ff.videoFilters(filter_pad(1000, 2000, 100, 200, '#0000ff'));
    }))
    .then(vf => vf.save_to(Deno.args[1] || "deno-ffmpeg-output.mp4"));
