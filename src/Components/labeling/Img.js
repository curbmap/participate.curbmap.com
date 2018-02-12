//https://gist.github.com/andrewluetgers/7c4a90cbe6341c401d0b7975a8ceeedb
import React, {Component} from 'react';
import {Image} from 'react-konva';


var imgCache = {
	brokenImage: document.createElement("img")
};

var brokenImage = imgCache.brokenImage;
brokenImage.src = "/assets/broken-image.png";
brokenImage.onload = function() {
	this.brokenImage = true;
};


class Img extends Component {

	constructor(...args) {
    super(...args);
		this.state = {
			image: null,
			error: false,
      loaded: false,
		};
	}

	loadImg(src) {
		if (!src) {
			throw new Error("Expected image src instead saw " + typeof src);
		}

		var img = imgCache[src];

		if (!img) {
			img = imgCache[src] = document.createElement("img");
			img.loadFns = [];
			img.errorFns = [];
			img.onerror = function() {
				img.error = true;
				img.errorFns.forEach(fn => fn.call(img));

			};
			img.onload = function() {
				var hasNH = 'naturalHeight' in img,
					w = hasNH ? 'naturalWidth' : 'width',
					h = hasNH ? 'naturalHeight' : 'height',
					invalidImg = img[w] + img[h] == 0;

				if (invalidImg) {
          // empty image
					img.onerror();
				} else {
					img.loaded = true;
					img.loadFns.forEach(fn => fn.call(img));
				}
			};
		}

		if (!img.loaded && !img.error) {
			img.loadFns.push(() => {
				img.loaded = true;
				this.setState({loaded: true, image: img});
      });

			img.errorFns.push(() => {
				img.error = true;
				this.setState({error: true, image: brokenImage});
			});

		} else if (img.error) {
			this.setState({error: true, image: brokenImage});
		} else {
			this.setState({loaded: true, image: img});
		}

		if (!img.src) {
			img.src = src;
		}

	}

	fillRect = (p, c) => {
		return (c.width / c.height) < (p.width / p.height)
			? {width: p.width, height: c.height * (p.width / c.width)}
			: {height: p.height, width: c.width * (p.height / c.height)};
	};

	fitRect = (p, c) => {
		let val = (c.width / c.height) > (p.width / p.height)
			? {width: p.width, height: c.height * (p.width / c.width)}
      : {height: p.height, width: c.width * (p.height / c.height)};
    //This way we can update the display when resized in the parent
    this.props.onLoad(val);
    return val;
	};

	getDims = (space, parent, child) => {
		switch (space) {
			case "fill":
        return this.fillRect(parent, child); 
        break;
			case "fit":
			default:
        return this.fitRect(parent, child); 
        break;
		}
	};

	componentWillMount = () => {
		this.loadImg(this.props.src);
	};

	render = () => {
		var selfDims = {width: this.props.width, height: this.props.height},
			image = this.state.image,
			imageDims = image ? {width: image.width, height: image.height} : selfDims,
			dims = this.getDims(this.props.space, selfDims, imageDims),
			pos = {x: this.props.x || 0, y: this.props.y || 0};

		return (
			<Image id="background" image={this.state.image} x={pos.x} y={pos.y} width={dims.width} height={dims.height}  />
		);
	};
}

export default Img;