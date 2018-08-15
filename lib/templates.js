export default {
  grid: `
    <div class="grid-vis">
      {{#each rows}}
        <div class="row">
          {{#each .}}
            <div class="cell type-{{.}}">
              {{.}}
            </div>
          {{/each}}
        </div>
      {{/each}}
    </div>
  `,
  infoPane: `
    {{#with info}}
      <div class="info-pane">
        <div class="score">Score: {{score}}</div>
        {{#if nextItem}}
          <div class="next">
            <svg class="next-item type-{{nextItem.type}}" viewBox="0 0 {{nextItem.width}} {{nextItem.height}}">
              {{#each nextItem.points}}
                <rect x="{{.[0]}}" y="{{.[1]}}" width="1" height="1" stroke="rgba(0, 0, 0, .1)" stroke-width=".1" />
              {{/each}}
            </svg>
            <span class="next-label">Next</span>
          </div>
        {{/if}}
      </div>
    {{/with}}
  `,
  layout: `
    <infoPane info="{{info}}" />
    <grid rows="{{grid}}" />
  `
}
