jQuery.noConflict();

jQuery(window).load(function(){
	jQuery(document).find('.gkTabsGK5').each(function(i, el) {
		el = jQuery(el);
		var config = jQuery.parseJSON(el.attr('data-config').replace(new RegExp('\'', 'g'), '"')); 
		config['module_id'] = el.attr('id');
		var tabs = el.find('.gkTabsItem');
		var items = el.find('.gkTabsNav .gkTab');
		var tabs_wrapper = jQuery(el.find('.gkTabsContainer')[0]);
		var animation = (config['animation'] == 0) ? true : false;
		config['current_tab'] = config['active_tab'] - 1;
		config['previous_tab'] = null;
		var amount = tabs.length;
		var timer = false;
		config['blank'] = false;
		config['falsy_click'] = false;
		config['hover'] = false;
		var animation_type = config['animation_type'];
		//
		tabs_wrapper.css('height', 'auto');
		
		el.mouseenter(function() {
			config['hover'] = true;
		});
		
		el.mouseleave(function() {
			config['hover'] = false;
		});
		
		// set the fixed height
		if(config['auto_height'] == '0') {
			tabs_wrapper.css('height', config['module_height'] + 'px');
		}
		// add events to tabs
		items.each(function(i, item){
			item = jQuery(item);
			item.bind(config['activator'], function(){
				tabsGK5Animation(i, tabs_wrapper, tabs, items, config);
			});
		});
		// add events to buttons
		if(el.find('.gkTabsButtonNext').length > 0) {
			jQuery(el.find('.gkTabsButtonNext')[0]).click(function() {
				if(config['current_tab'] < amount - 1) {
					tabsGK5Animation(config['current_tab'] + 1, tabs_wrapper, tabs, items, config);
				} else {
					tabsGK5Animation(0, tabs_wrapper, tabs, items, config);	
				}
			});
			
			jQuery(el.find('.gkTabsButtonPrev')[0]).click(function() {
				if(config['current_tab'] > 0) {
					tabsGK5Animation(config['current_tab'] - 1, tabs_wrapper, tabs, items, config);
				} else {
					tabsGK5Animation(amount - 1, tabs_wrapper, tabs, items, config);
				}
			});
		}
		//
		if(config["animation"] == 1) {
			setInterval(function(){
				if(config['hover']) {
					config['blank'] = true;
				}
				
				if(!config['blank']) {
					config['falsy_click'] = true;

					if(config['current_tab'] < amount - 1) {
						tabsGK5Animation(config['current_tab'] + 1, tabs_wrapper, tabs, items, config);
					} else {
						tabsGK5Animation(0, tabs_wrapper, tabs, items, config);
					}
				} else {
					config['blank'] = false;
				}
			}, config["animation_interval"]);
		}
		// touch events
		if(el.attr('data-swipe') == '1') {
			var arts_pos_start_x = 0;
			var arts_pos_start_y = 0;
			var arts_time_start = 0;
			var arts_swipe = false;
			
			el.bind('touchstart', function(e) {
				arts_swipe = true;
				var touches = e.originalEvent.changedTouches || e.originalEvent.touches;
	
				if(touches.length > 0) {
					arts_pos_start_x = touches[0].pageX;
					arts_pos_start_y = touches[0].pageY;
					arts_time_start = new Date().getTime();
				}
			});
			
			el.bind('touchmove', function(e) {
				var touches = e.originalEvent.changedTouches || e.originalEvent.touches;
				
				if(touches.length > 0 && arts_swipe) {
					if(
						Math.abs(touches[0].pageX - arts_pos_start_x) > Math.abs(touches[0].pageY - arts_pos_start_y)
					) {
						e.preventDefault();
					} else {
						arts_swipe = false;
					}
				}
			});
						
			el.bind('touchend', function(e) {
				var touches = e.originalEvent.changedTouches || e.originalEvent.touches;
				
				if(touches.length > 0 && arts_swipe) {									
					if(
						Math.abs(touches[0].pageX - arts_pos_start_x) >= 30 && 
						new Date().getTime() - arts_time_start <= 500
					) {					
						if(touches[0].pageX - arts_pos_start_x > 0) {
							if(config['current_tab'] > 0) {
								tabsGK5Animation(config['current_tab'] - 1, tabs_wrapper, tabs, items, config);
							} else {
								tabsGK5Animation(amount - 1, tabs_wrapper, tabs, items, config);
							}
						} else {
							if(config['current_tab'] < amount - 1) {
								tabsGK5Animation(config['current_tab'] + 1, tabs_wrapper, tabs, items, config);
							} else {
								tabsGK5Animation(0, tabs_wrapper, tabs, items, config);	
							}
						}
					}
				}
			});
		}
	});
});

var tabsGK5Animation = function(i, tabs_wrapper, tabs, items, config) {
	var direction = (config['rtl'] == 0) ? 'left' : 'right';
	
	if(i != config['current_tab']) {
		config['previous_tab'] = config['current_tab'];
		config['current_tab'] = i;
		
		if(config['auto_height'] == '1') {
			tabs_wrapper.css('min-height', tabs_wrapper.outerHeight() + 'px');
		}
		
		tabs.removeClass('gk-active');
		jQuery(tabs[i]).addClass('gk-active');
		jQuery(tabs[config['previous_tab']]).removeClass('gk-active');
		jQuery(tabs[config['previous_tab']]).addClass('gk-hidden');
		jQuery(tabs[i]).removeClass('gk-hide');
		jQuery(tabs[i]).removeClass('gk-hidden');
		jQuery(tabs[i]).addClass('gk-active');
		
		jQuery(items[config['previous_tab']]).removeClass('active');
		jQuery(items[i]).addClass('active');
		
		var prev = config['previous_tab'];
		
		setTimeout(function() {
			if(jQuery(tabs[prev]).hasClass('gk-hidden') && !jQuery(tabs[prev]).hasClass('gk-active')) {
				jQuery(tabs[prev]).removeClass('gk-hidden');
				jQuery(tabs[prev]).addClass('gk-hide');
			}
		}, 350);
		
		//
		if(config['auto_height'] == '1') {
			tabs_wrapper.css('min-height', jQuery(tabs[i]).outerHeight() + "px");
			
			setTimeout(function() {
				tabs_wrapper.css('height', 'auto');
			}, 350);
		}
		
		// external trigger
		if(typeof gkTabEventTrigger !== 'undefined') {
			gkTabEventTrigger(i, i, config['module_id']);
		}
		// common operations for both types of animation
		if(!config['falsy_click']) {
			config['blank'] = true;
		} else {
			config['falsy_click'] = false;
		}
		
		// save the cookie
		if(config['cookie_save'] == 1) {					
			var date = new Date();
			date.setTime(date.getTime()+(256*24*60*60*1000));
			document.cookie = ('gktab-' + config['module_id']) + "=" + (i + 1) + ("; expires="+date.toGMTString()) + "; path=/";
		}
	}
};