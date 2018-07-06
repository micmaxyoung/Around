import React from 'react';
import $ from 'jquery';
import { Tabs, Button, Spin } from 'antd';
import { GEO_OPTIONS, POS_KEY, AUTH_PREFIX, TOKEN_KEY, API_ROOT } from '../constants';
import { Gallery } from './Gallery';

const TabPane = Tabs.TabPane;
const operations = <Button>Extra Action</Button>;

export class Home extends React.Component {
    state = {
        loadingGeoLocation: false,
        loadingPost: false,
        error: '',
		posts: [],
    }

	componentDidMount() {
		this.setState({ loadingGeoLocation: true, error: '' });
		this.getGeoLocation();
	}

	getGeoLocation = () => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				this.onSuccessLoadGeoLocation,
				this.onFailedLoadGeolocation,
				GEO_OPTIONS,
			);
		} else {
		    this.setState({ loadingGeoLocation: false, error: 'Your browser does not support geolocation!' });
		}
	}

	onSuccessLoadGeoLocation = (position) => {
		console.log(position);
		this.setState({ loadingGeoLocation: false, error: '' });
		const { latitude, longitude } = position.coords;
		localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude}));
		this.loadNearPosts();
	}

	onFailedLoadGeolocation = () => {
		this.setState({ loadingGeoLocation: false, error: 'Failed to load geo location!' });
	}

	loadNearPosts = () => {
	    const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
	    this.setState({ loadingPost: true, error: '' });
	    $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`,
            method: 'GET',
            header: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`,
            },
        }).then((response) => {
            console.log(response);
			this.setState({ posts: response, loadingPost: false, error: '' });
        }, (error) => {
			this.setState({ loadingPost: false, error: error.responseText });
        }).catch((err) => {
            console.log(err);
        });
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip='Loading Geo Location...'/>;
        } else if (this.state.loadingPost) {
            return <Spin tip='Loading Posts...'/>;
        } else if (this.state.posts && this.state.posts.length > 0) {
        	const images = this.state.posts.map((post) => {
        		return {
					user: post.user,
					src: post.url,
					thumbnail: post.url,
					caption: post.message,
					thumbnailWidth: 400,
					thumbnailHeight: 300,
				};
			});
        	return <Gallery images={images}/>;
		}
        return null;
    }

	render() {
		return (
			<Tabs tabBarExtraContent={operations} className="main-tabs">
				<TabPane tab="Posts" key="1">
                    {this.getGalleryPanelContent()}
                </TabPane>
				<TabPane tab="Map" key="2">Content of tab 2</TabPane>
			</Tabs>
		);
	}
}
