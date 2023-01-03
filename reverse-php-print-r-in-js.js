// Based on simivar's print_r_reverse.php
// https://gist.github.com/simivar/037b13a9bbd53ae5a092d8f6d9828bc3

let phpArrayParser = (rawinput)=>{
	let input = rawinput.trim();


	let lines = input.split(/\n/g);
	if (lines[0].trim() !== 'Array' && lines[0].trim() !== 'stdClass Object') {
		// bottomed out to something that isn't an array or object
		if (input === '') {
		 return null;
		}
		return input;
	} else {
		// this is an array or object, lets parse it
		let match = lines[1].match(/(\s{5,})\(/);
		if ((match || []).length>0) {
			// this is a tested array/recursive call to this function
			// take a set of spaces off the beginning
			let spaces = match[ 1 ];
			let spaces_length = spaces.length;
			let lines_total = lines.length;
			for (let i = 0; i < lines_total; i++) {
				if (lines[i].substring(0, spaces_length) === spaces) {
					lines[i] = lines[i].substring(spaces_length);
				}
			}
		}

		lines.shift(); // Array
		lines.shift(); // (
		lines.pop(); // )
		input = lines.join("\n");

		// make sure we only match stuff with 4 preceding spaces (stuff for this array and not a nested one)
		let tempMatches = input.matchAll(/^\s{4}\[(.+?)\] \=\> /gm);
		let next = tempMatches.next();
		let matches = [];
		while(next.done === false){
			 matches.push([
				 [next.value['0'], next.value['index']],
				 [next.value['1'], input.indexOf(next.value['1'], next.value['0'])]
			 ]);
			 next = tempMatches.next();
		}

		let pos = [];
		let previous_key = '';
		let in_length = input.length;
		// store the following in pos:
		// array with key = key of the parsed array's item
		// value = array(start position, end position)
		for (let i = 0; i < matches.length; i++) {
			let match = matches[i];
			let key = match[ 1 ][ 0 ];
			let start = match[ 0 ][ 1 ] + (match[ 0 ][ 0 ]).length;
			pos[ key ] = [start, in_length];
			if (previous_key !== '') {
				pos[ previous_key ][ 1 ] = match[ 0 ][ 1 ] - 1;
			}
			previous_key = key;
		}

		let ret = null;
		// decide whether this node is an object or array
		if(isNaN(parseInt(Object.keys(pos).join("")))){
			// object
			ret = {};
			Object.keys(pos).forEach((value)=>{
				ret[value] = phpArrayParser(input.substring(pos[value][0], pos[value][1]));
			});
		} else {
			// array
			ret = [];
			Object.keys(pos).forEach((value)=>{
				ret.push(phpArrayParser(input.substring(pos[value][0], pos[value][1])));
			});
		}

	return ret;
	}
};