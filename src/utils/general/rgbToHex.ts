let componentToHex = (c: number): string => {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };
  
  export let rgbToHex = ({
    r,
    g,
    b,
  }: {
    r: number;
    g: number;
    b: number;
  }): string => {
    return (
      '#' +
      componentToHex(Math.round(r * 255)) +
      componentToHex(Math.round(g * 255)) +
      componentToHex(Math.round(b * 255))
    );
  };
  