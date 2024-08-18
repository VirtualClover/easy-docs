import * as React from 'react';

import {
  AppBar,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  SwitchProps,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { PluginSettings, SETTINGS_GROUPS } from '../utils/constants';

import { GitHub } from '@mui/icons-material';
import { MuiMarkdown } from 'mui-markdown';
import { PluginDataContext } from '../utils/constants/PluginDataContext';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { ViewContainer } from './components/ViewContainer';
import aboutDoc from '../../README.md';
import { clone } from '../utils/general/clone';
import { generateA11yProps } from '../utils/editor/generateA11yProps';
import metadata from '../../package.json';

let AboutView = () => {
  {
    let AboutTabWrapper = styled('div')({
      div: { display: 'flex', flexDirection: 'column', gap: 16 },
    });

    return (
      <AboutTabWrapper>
        <Box
          sx={{
            pb: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          style={{ flexDirection: 'row' }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            Plugin version: {process.env.npm_package_version}
          </Typography>
          <Tooltip title="Go to the GitHub repo">
            <IconButton href={metadata.repository.url} target="_blank">
              <GitHub />
            </IconButton>
          </Tooltip>
        </Box>
        <MuiMarkdown>{aboutDoc}</MuiMarkdown>
      </AboutTabWrapper>
    );
  }
};

let FigmaSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 32,
  height: 16,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 1,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: `6px solid #fff`,
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,
    height: 14,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.background.paper,
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

let ExportsViewContainer = styled(Box)({
  '.MuiFormControl-root': {
    width: '100%',
  },

  '.MuiFormControlLabel-labelPlacementStart': {
    marginLeft: 0,
    width: '100%',
  },

  '.MuiFormControlLabel-label': {
    flex: 1,
  },

  '.MuiFormHelperText-root': {
    maxWidth: 450,
    fontSize: '.8rem',
  },
});

let SettingsSection = ({
  children,
  sectionName = 'Section',
  hasDivider = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 24,
        marginBottom: 24,
        borderBottom: `${hasDivider ? '1px' : '0'} solid`,
        borderColor: 'divider',
      }}
      component="section"
    >
      <Typography variant="h4">{sectionName}</Typography>
      <FormControl
        component="fieldset"
        variant="standard"
        sx={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        {children}
      </FormControl>
    </Box>
  );
};

let ExportsView = () => {
  const pluginContext = React.useContext(PluginDataContext);
  let tempSettingsObj: PluginSettings = clone(pluginContext.settings);

  let updateSettingsObj = () => {
    pluginContext.setSettings(tempSettingsObj);
    parent.postMessage(
      {
        pluginMessage: {
          type: 'update-settings',
          settings: tempSettingsObj,
        },
      },
      '*'
    );
  };

  React.useEffect(() => {
    //console.log(tempSettingsObj);
  }, [tempSettingsObj]);

  return (
    <ExportsViewContainer>
      <SettingsSection sectionName="General Settings">
        <FormGroup>
          <FormControlLabel
            labelPlacement="start"
            control={
              <FigmaSwitch
                checked={tempSettingsObj.export.referenceLinks}
                onChange={(e) => {
                  tempSettingsObj.export.referenceLinks =
                    !tempSettingsObj.export.referenceLinks;
                  updateSettingsObj();
                  console.log(tempSettingsObj.export.referenceLinks);
                }}
                name="reference links"
              />
            }
            label="[EXPERIMENTAL] Enable reference links"
          />
          <FormHelperText>
            If a link reference another page frame in Figma, the exported file
            will try and reference the homogenus file instead of the figma
            frame.
          </FormHelperText>
        </FormGroup>
      </SettingsSection>
      <SettingsSection sectionName="Markdown Settings">
        <FormGroup>
          <FormControlLabel
            labelPlacement="start"
            control={
              <FigmaSwitch
                checked={tempSettingsObj.export.md.linkIframes}
                onChange={(e) => {
                  tempSettingsObj.export.md.linkIframes =
                    !tempSettingsObj.export.md.linkIframes;
                  updateSettingsObj();
                }}
                name="iframes"
              />
            }
            label="Export iframes as links"
          />
          <FormHelperText>
            Tells the plugin to export frames as links instead of iframes.
          </FormHelperText>
        </FormGroup>
      </SettingsSection>
      <SettingsSection sectionName="HTML Settings" hasDivider={false}>
        <FormGroup>
          <FormControlLabel
            labelPlacement="start"
            control={
              <FigmaSwitch
                checked={tempSettingsObj.export.html.bodyOnly}
                onChange={(e) => {
                  tempSettingsObj.export.html.bodyOnly =
                    !tempSettingsObj.export.html.bodyOnly;
                  updateSettingsObj();
                }}
                name="iframes"
              />
            }
            label="Export <body> content only"
          />
          <FormHelperText>
            Tells the plugin to export only the content of the &#60;body&#62;
            tag, instead of the whole HTML markup.
          </FormHelperText>
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            labelPlacement="start"
            control={
              <FigmaSwitch
                checked={tempSettingsObj.export.html.addStyling}
                disabled={tempSettingsObj.export.html.bodyOnly}
                onChange={(e) => {
                  tempSettingsObj.export.html.addStyling =
                    !tempSettingsObj.export.html.addStyling;
                  updateSettingsObj();
                }}
                name="iframes"
              />
            }
            label="Add styling to exports"
          />
          <FormHelperText>Adds a default style to the HTML</FormHelperText>
        </FormGroup>
      </SettingsSection>
    </ExportsViewContainer>
  );
};

export const SettingsView = ({}) => {
  const [showAPIKey, setShowAPIKey] = React.useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = React.useState(0);
  const [tabs, setTabs] = React.useState([]);
  let views = [<ExportsView />, <AboutView />];
  let [view, setView] = React.useState(views[0]);

  const handleClickShowAPIKey = () => setShowAPIKey((show) => !show);

  const handleMouseDownAPIKey = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  React.useEffect(() => {
    let tempTabs: ReactJSXElement[] = [];
    for (let i = 0; i < SETTINGS_GROUPS.length; i++) {
      let tabLabel = SETTINGS_GROUPS[i];
      tempTabs.push(
        <Tab
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            whiteSpace: 'noWrap',
            textOverflow: 'ellipsis',
            display: 'block',
            flexDirection: 'row',
          }}
          label={tabLabel}
          {...generateA11yProps(i)}
          key={i}
        />
      );
    }
    setTabs(tempTabs);
  }, []);

  let handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    setSettingsActiveTab(newActiveTab);
    setView(views[newActiveTab]);
  };

  return (
    <ViewContainer>
      <AppBar elevation={0} color="transparent" sx={{ top: 49 }}>
        <Stack direction="row">
          <Tabs
            value={settingsActiveTab}
            variant={'scrollable'} // If we remove this ternary the Tabs component bugs out
            scrollButtons={'auto'}
            onChange={handleChange}
            aria-label="Setting categories"
          >
            {tabs}
          </Tabs>
        </Stack>
        <Divider />
      </AppBar>
      <Stack>
        <Toolbar variant="dense" />
      </Stack>
      <Box
        sx={{
          overflow: 'auto',
          flex: 1,
          alignSelf: 'stretch',
          padding: '16px 16px 0 16px',
        }}
      >
        {view}
      </Box>
      <Snackbar
        open={false}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={'Changes saved!'}
      />
    </ViewContainer>
  );
};
