export default {
  grid: `
    <div class="grid-vis">
      {{#each rows}}
        <div class="row">
          {{#each .}}
            <div class="cell type-{{.}}" style="color: {{~/getItemColor(.)}}"></div>
          {{/each}}
        </div>
      {{/each}}
    </div>
  `,
  infoPane: `
    {{#with info}}
      <div class="info-pane">
        <div class="score">Score: {{score}}</div>
        {{#with nextItem}}
          <div class="next">
            <svg class="next-item" viewBox="0 0 {{width}} {{height}}">
              {{#each points}}
                <rect
                  x="{{.[0]}}"
                  y="{{.[1]}}"
                  width="1"
                  height="1"
                  fill="{{~/getItemColor(../../type)}}"
                  stroke="rgba(0, 0, 0, .1)"
                  stroke-width=".1"
                />
              {{/each}}
            </svg>
            <span class="next-label">Next</span>
          </div>
        {{/with}}
      </div>
    {{/with}}
  `,
  layout: `
    <infoPane info="{{info}}" getItemColor={{getItemColor}} />
    <grid rows="{{grid}}" getItemColor={{getItemColor}} />
  `
}
