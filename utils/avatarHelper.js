export const getAvatarSource = (userData) => {
    if (userData.avatarUrl) {
      return { uri: userData.avatarUrl };
    } else if (userData.gender?.toLowerCase() === 'male') {
      return require('../assets/image/blankmale.png');
    } else if (userData.gender?.toLowerCase() === 'female') {
      return require('../assets/image/blankfemale.png');
    } else {
      return require('../assets/image/blankmale.png');
    }
  };