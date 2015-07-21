hiu.replaceState = function(state,title,url)
{
	hiu.state = state;
	if((!$.browser.msie)&&history!=undefined)
	{
		history.replaceState(state,title,url);
	}
};
hiu.pushState = function(state,title,url)
{
	hiu.state = state;
	if((!$.browser.msie)&&history!=undefined)
	{
		history.pushState(state,title,url);
	}
};
