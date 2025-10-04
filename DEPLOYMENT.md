# GitHub Pages Deployment Guide

This guide will help you deploy the Contractor Scheduler application to GitHub Pages.

## Prerequisites

- A GitHub account
- The repository pushed to GitHub
- GitHub Pages enabled in your repository settings

## Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

## Step 2: Push Your Code

1. Add all files to git:
```bash
git add .
```

2. Commit your changes:
```bash
git commit -m "Configure for GitHub Pages deployment"
```

3. Push to GitHub:
```bash
git push origin main
```

## Step 3: Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for the workflow to complete (usually takes 2-3 minutes)
4. Once completed, your site will be available at:
   `https://yourusername.github.io/contractor-scheduler`

## Step 4: Verify Deployment

1. Visit your GitHub Pages URL
2. Test all functionality:
   - Contractor management
   - Calendar view
   - Analytics dashboard
   - Data export features
   - Tag creation and management

## Troubleshooting

### Site Shows README Instead of Application

If your GitHub Pages site is showing the README file instead of the application:

1. **Check Pages Source**: Go to Settings → Pages and ensure "Source" is set to "GitHub Actions"
2. **Check Workflow**: Go to Actions tab and verify the workflow completed successfully
3. **Check Permissions**: Ensure the repository has Pages permissions enabled
4. **Manual Trigger**: If needed, go to Actions → "Deploy to GitHub Pages" → "Run workflow"

### Build Failures

- Check the Actions tab for error details
- Ensure all dependencies are properly installed
- Verify TypeScript compilation passes locally

### Site Not Loading

- Wait a few minutes after deployment
- Check if GitHub Pages is enabled in repository settings
- Verify the correct branch is selected for Pages source
- Clear browser cache and try again

### Functionality Issues

- Test locally with `npm run build` and `npm run export`
- Check browser console for JavaScript errors
- Verify all static assets are properly generated

## Configuration Details

### Build Configuration
- **Static Export**: Configured in `next.config.ts` with `output: 'export'`
- **Trailing Slash**: Enabled for GitHub Pages compatibility
- **Images**: Set to unoptimized for static hosting
- **Build Output**: Generated in `out/` directory

### GitHub Actions Workflow
- **Trigger**: Runs on push to `main` branch and manual dispatch
- **Node Version**: Uses Node.js 18
- **Build Command**: `npm run build`
- **Deploy**: Uses official GitHub Pages actions
- **Publish Directory**: `./out`
- **Permissions**: Configured for Pages deployment

### Files Created for Deployment
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `public/.nojekyll` - Prevents Jekyll processing
- `index.html` - Fallback redirect page
- `README.md` - Project documentation
- `next.config.ts` - Next.js configuration for static export

## Custom Domain (Optional)

To use a custom domain:

1. Create a `CNAME` file in the `public` directory:
```
yourdomain.com
```

2. Configure your domain's DNS settings:
   - Add a CNAME record pointing to `yourusername.github.io`

3. Enable custom domain in GitHub Pages settings

## Manual Deployment

If you prefer manual deployment:

1. Build the application:
```bash
npm run build
```

2. Upload the contents of the `out` directory to your web hosting service

## Support

For issues with deployment:
- Check GitHub Actions logs
- Review Next.js static export documentation
- Verify GitHub Pages documentation for any service-specific issues
- Ensure repository has proper permissions for Pages deployment
