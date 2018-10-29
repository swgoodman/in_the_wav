

//Album Constructor Function
function Album(name, artist, release_date, external_url, image_url) {
  this.name = name
  this.artist = artist
  this.release_date = release_date
  this.external_url = external_url
  this.image_url = image_url

  //Custom Album Object Method
  this.recent = function() {
    if (this.release_date > "2018-01-01")
      return "Recent!"
      console.log("recent")
  }
}


//Search Spotify API and Return Search Results as JSON Album Objects
$(function () {
  $('#search_form').on("submit", function(e) {
    e.preventDefault();
    accessToken = $("input[name='credentials']").val()
    term = $("input[name='search']").val()
    url = "https://api.spotify.com/v1/search?q=" + term + "&type=album"
    $.ajax({
      url: url,
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      }
    }).success(function(response) {

      //Show Search Results in DOM
      var $search_list = $("div#search_results ul")
      $search_list.html("")
      let i = 0
      $.each(response.albums.items, function(name, value) {
        let name_attr = value.name
        let artist_attr = value.artists[0].name
        let release_attr = value.release_date
        let url_attr = value.external_urls.spotify
        let image_attr = value.images[0].url
        let album = new Album(name_attr, artist_attr, release_attr, url_attr, image_attr);
        $search_list.append('<li class"returned_albums">' +
          album.name +
          ' - ' +
          album.artist +
          '<form class="add_album" id="' + i + '"><input type=hidden name="authenticity_token" value="' +  '<%= form_authenticity_token %>'  + '"><input id="name" value="' + album.name + '" type="hidden"><input id="artist" value="' + album.artist + '" type="hidden"><input id="release" value="' + album.release_date + '" type="hidden"><input id="url" value="' + album.external_url + '" type="hidden"><input id="image" value="' + album.image_url + '" type="hidden"><input type="submit" value="Add" name="commit">' +
          '</li>');
        i++
      })

      //Persist Album in Database
      $(function createAlbum() {
        $("form.add_album").on('click', function(e){
          let that = $(this);
          e.preventDefault();
          url = this.action
          data = {
            'authenticity_token': $("input[name='authenticity_token']").val(),
            album: {
              'name': $(this.name).val(),
              'artist': $(this.artist).val(),
              'release_date': $(this.release).val(),
              'release_external_url': $(this.url).val(),
              'release_image_url': $(this.image).val(),
            }
          };
          $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function(response) {

              //Add Album to 'Albums' list in DOM
              $('#album_list').append('<li>' + response.name + ' --- ' + "<a href='/users/" + response.user_id + "/albums/" + response.id + "' class='more_info'>More Info</a> - <a href='" + response.release_external_url + "' target='_blank' rel='noopener noreferrer'>LISTEN!</a></li>")
              $('.more_info').on('click', function(e) {
                e.preventDefault()
                  $.ajax({
                    type: "GET",
                    url: this.href + ".json"
                  }).done(function(data) {
                    var $show_album = $('#show_album')
                    $show_album.empty()

                    //Show 'More Info' in DOM
                    $('#show_album').append("<img src='" + data.release_image_url +"' heigh='100' width='100'><h3>" + data.name + "</h3><h5>" + data.artist + "</h5><p>" + data.release_date + "</p><a href='" + data.release_external_url + "' target='_blank' rel='noopener noreferrer'>LISTEN!</a>")
                  })
              })
            }
          })
        })

        //Reset Buttons and Forms
        $('form.add_album').each(function() {
          this.reset();
        });
      });
      $('#search_form').each(function() {
        this.reset();
      });

    //Error Alert
    }).error(function(notNeeded) {
      alert("Error, please try again. If error persists, please log out and back in again.")
    });
  });

  //'More Info' functionality with adding an Album first
  $('.more_info').on('click', function(e) {
    e.preventDefault()
      $.ajax({
        type: "GET",
        url: this.href + ".json"
      }).done(function(data) {
        console.log(data)
        var $show_album = $('#show_album')
        $show_album.empty()
        $('#show_album').append("<img src='" + data.release_image_url +"' heigh='100' width='100'><h3>" + data.name + "</h3><h5>" + data.artist + "</h5><p>" + data.release_date + "</p><a href='" + data.release_external_url + "' target='_blank' rel='noopener noreferrer'>LISTEN!</a>")
      })
  })
});
