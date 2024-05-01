export const createNewPageJSON = (arrayNumber) => {
  let data = {
    blocks: [
      {
        type: 'header',
        lastEdited: Date.now(),
        data: {
          text: `Page ${arrayNumber}`,
          level: 1,
        },
      },
      {
        type: 'paragraph',
        lastEdited: Date.now(),
        data: {
          text: 'Click here to start editing!',
        },
      },
    ],
    title: `Page ${arrayNumber}`,
  };

  return data;
};
