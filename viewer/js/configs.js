var configs = {
'city_daytime': {'levels': '6', 'tile_size': '1024', 'frame_number': '200', 'width': '1964', 'height': '873', 'x_tiles': ['2', '4', '8', '16', '31', '62'], 'y_tiles': ['1', '2', '4', '7', '14', '28'],'min_zoom':'2'}, 
'city_night': {'levels': '6', 'tile_size': '1024', 'frame_number': '200', 'width': '2092', 'height': '490', 'x_tiles': ['3', '5', '9', '17', '33', '66'], 'y_tiles': ['1', '1', '2', '4', '8', '15'], 'min_zoom': '0'}, 
'commencement': {'levels': '6', 'tile_size': '1024', 'frame_number': '200', 'width': '440', 'height': '206', 'x_tiles': ['1', '1', '2', '4', '7', '14'], 'y_tiles': ['1', '1', '1', '2', '4', '7'], 'min_zoom': '0'}, 
'seafront': {'levels': '6', 'tile_size': '1024', 'frame_number': '200', 'width': '1835', 'height': '640', 'x_tiles': ['2', '4', '8', '15', '29', '58'], 'y_tiles': ['1', '2', '3', '5', '10', '20'], 'min_zoom': '0'}, 
'square': {'levels': '6', 'tile_size': '1024', 'frame_number': '200', 'width': '657', 'height': '385', 'x_tiles': ['1', '2', '3', '6', '11', '21'], 'y_tiles': ['1', '1', '2', '4', '7', '13'], 'min_zoom': '0'}};

var viewer_data = 'city_daytime';
if (urlParams["data"]) {
	viewer_data = urlParams["data"];
}