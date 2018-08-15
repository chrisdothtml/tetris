export default {
  grid: `
    <div class="grid-vis">
      {{#each rows}}
        <div class="row">
          {{#each .}}
            <div class="cell cell-{{.}}">
              {{.}}
            </div>
          {{/each}}
        </div>
      {{/each}}
    </div>
  `,
  infoPane: `
    <div class="info-pane">
      Score: {{info.score}}
    </div>
  `,
  layout: `
    <infoPane info="{{info}}" />
    <grid rows="{{grid}}" />
  `
}
