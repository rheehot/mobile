import React from 'react'
import Navigation from 'modules/navigation'
import Events from 'modules/events'
import TreeContainer from 'co/collections/items'
import buttons from 'co/collections/items/buttons'
import { themed } from 'co/style/colors'
import { connect } from 'react-redux'
import { detailScreenId } from 'root/app/ipad'
import withSplitView from 'co/common/ipad/withSplitView'

class iPadScreen extends React.Component {
	static options() {
		return {
			topBar: {
				background: {
					color: themed.mainAlt()
				},
				title: {
					component: {
						name: 'component/logoText',
						alignment: 'center'
					}
				},
				...buttons,
				leftButtons: [
					{
						id: 'settings',
						icon: require('assets/images/settings.png')
					}
				]
			},
			layout: {
				componentBackgroundColor: themed.mainAlt()
			}
		}
	}

	state = {
		selectedId: this.props.selectedId
	}

	componentDidMount() {
		Events.on('create-collection', this.onCreateNew)
		_navigationEvents = Navigation.events().bindComponent(this)
	}

	componentWillUnmount() {
		Events.off('create-collection', this.onCreateNew)
		this._navigationEvents && this._navigationEvents.remove()
	}

	navigationButtonPressed({ buttonId }) {
		switch(buttonId){
			case 'settings':
				Navigation.showModal(this.props, 'settings/home')
			break
		}
	}

	onItemTap = (item)=>{
		if (!this.props.isNarrow()){
			this.setState({
				selectedId: item._id
			})
			try{Navigation.popToRoot({ componentId: 'detail-stack' })}catch(e){}
			Navigation.updateProps({ componentId: detailScreenId }, { spaceId: item._id })
		} else {
			this.props.setLastCollection(item._id)
			this.props.restart()
		}
	}

	onCreateNew = (item)=>{
		Navigation.showModal(this.props, 'collection/add', {
			...item,
			onSuccess: this.onItemTap
		})
	}

	onSystemDrop = ({ _id }, data)=>{
		Navigation.showModal(this.props, 'bookmark/add/save', {
			...data,
			collectionId: _id
		})
	}

	render() {
		return (
			<TreeContainer 
				{...this.props}
				{...this.state}
				onItemTap={this.onItemTap}
				onCreateNew={this.onCreateNew}
				onSystemDrop={this.onSystemDrop} />
		)
	}
}

export default connect(
	(state)=>({
		selectedId: state.config.last_collection,
	}),
	{
		setLastCollection: require('data/actions/config').setLastCollection,
		restart: require('local/actions/app').restart
	}
)(withSplitView(iPadScreen))