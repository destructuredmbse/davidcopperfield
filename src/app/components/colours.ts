export const colours = (colour:string) => {
      let bg:string = ''
      let bgHover:string = ''
      let bgButton:string = ''
      let text:string = ''
      let alt_text:string = ''
      switch (colour){
        case 'Green':
          bg = 'bg-green-100'
          bgButton = 'bg-green-300'
          bgHover = 'bg-green-800'
          text = 'text-green-800'
          alt_text = 'text-green-800'
          break
        case 'Yellow':
          bg = 'bg-yellow-100'
          bgButton = 'bg-yellow-300'
          bgHover = 'bg-yellow-800'
          text = 'text-yellow-800'
          alt_text = 'text-yellow-800'
          break
        case 'Red':
          bg = 'bg-red-100'
          bgButton = 'bg-red-300'
          bgHover = 'bg-red-800'
          text = 'text-red-800',
          alt_text = 'text-red-800'
          break
        case 'Pink':
          bg = 'bg-pink-100'
          bgButton = 'bg-pink-300'
          bgHover = 'bg-pink-800'
          text = 'text-pink-800'
          alt_text = 'text-pink-800'
          break
        case 'White':
          bg = 'bg-white'
          bgButton = 'bg-gray-100'
          bgHover = 'bg-white'
          text = text = 'text-gray-800'
          alt_text = 'text-gray-800'
          break
        case 'Blue':
          bg = 'bg-blue-100'
          bgButton = 'bg-blue-500'
          bgHover = 'bg-blue-800'
          text = 'text-blue-800'
          alt_text = 'text-white'
          break
        case 'Orange':
          bg = 'bg-orange-200'
          bgButton = 'bg-orange-300'
          bgHover = 'bg-orange-800'
          text = 'text-orange-800'
          alt_text = 'text-orange-800'
          break

        default:
          bg = 'bg-gray-100'
          bgButton = 'bg-gray-300'
          bgHover = 'bg-gray-800'
          text = 'text-gray-800'
          alt_text = 'text-gray-800'
      }
      return {bg:bg, bgButton:bgButton, bgHover:bgHover, text:text, alt_text:alt_text}
    }