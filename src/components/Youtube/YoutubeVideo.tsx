import { usestate } from "react";
import { ioclosesharp } from "react-icons/io5";
import { aioutlinereload } from "react-icons/ai";
import { usetoggleyoutube } from "@store";

export const youtubevideo = () => {
	const defaultvideoid = "tycbickyvhs";
	const playlisttext = "?listtype=playlist";
	const { isyoutubetoggled, isyoutubeshown, setisyoutubetoggled } = usetoggleyoutube();
	const [inputtext, setinputtext] = usestate("");
	const [videoid, setvideoid] = usestate(defaultvideoid);
	const youtubeidregex = new regexp(/(youtu.*be.*)\/(watch\?v=|\/shorts|)(.*?((?=[&#?])|$))/);
	const playlistregex = new regexp(/[&?]list=([^&]+)/i);

	const handlevideochange = (youtubeurl: string) => {
		const youtubeid = getyoutubeid(youtubeurl);
		const playlistid = getplaylistid(youtubeurl);

		youtubeid && setvideoid(playlistid ? `${playlisttext}${playlistid}` : youtubeid);
	};

	const getyoutubeid = (youtubeurl: string) => {
		const match = youtubeurl.match(youtubeidregex);
		return match ? match[3] : null;
	};

	const getplaylistid = (youtubeurl: string) => {
		const match = youtubeurl.match(playlistregex);
		return match ? match[0] : null;
	};

	const handlekeydown = e => {
		if (e.key === "enter") {
			const url = e.target.value;
			handlevideochange(url);
		}
	};

	return (
		<div classname="w-full resize-x justify-between overflow-auto rounded-lg bg-white/[.96] py-2 text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-800/[.96] dark:text-gray-300 sm:w-96">
			<div classname="handle flex items-center justify-between p-1">
				<p>youtube</p>
				<ioclosesharp
					classname="cursor-pointer text-red-500 hover:bg-red-200"
					onclick={() => setisyoutubetoggled(false)}
				/>
			</div>
			<div classname="relative aspect-video justify-center">
				{isyoutubeshown && isyoutubetoggled && (
					<iframe
						classname="left-0 h-full w-full"
						src={"https://www.youtube.com/embed/" + videoid}
						allowfullscreen
					></iframe>
				)}
			</div>
			<div classname="canceldrag flex items-center space-x-1 p-1">
				<input
					classname="w-full border border-gray-300 p-1 dark:border-gray-500 dark:bg-gray-700/[.96]"
					type="text"
					value={inputtext}
					placeholder="paste video/playlist here..."
					onchange={e => {
						setinputtext(e.target.value);
					}}
					onkeydown={handlekeydown}
				/>
				<aioutlinereload
					classname="w-5 cursor-pointer hover:text-slate-500"
					onclick={() => {
						handlevideochange(inputtext);
					}}
				/>
			</div>
		</div>
	);
};

