import { fetchUpcomingActivities } from "../api/public.js";
import { ApiError, isCancelled } from "../api/errors.js";
import { createRequestScope } from "../api/client.js";
import { createActivityCard } from "../components/activity-card.js";
import { createRegionState } from "../components/region-state.js";

const LOADING_MESSAGE = "Carregando próximas atividades…";
const EMPTY_MESSAGE = "Não há atividades próximas no momento.";
const EMPTY_HINT = "Veja todas as atividades.";

function loadedMessage(count) {
  return count === 1 ? "1 próxima atividade carregada." : `${count} próximas atividades carregadas.`;
}

function toCards(data) {
  if (!Array.isArray(data?.results)) throw new ApiError("invalid_response");
  return data.results.map((activity) => createActivityCard(activity, { headingLevel: 3 })).filter(Boolean);
}

// `content` e `status` devem existir no HTML antes da primeira troca de estado. Este módulo nunca move o foco.
export function initUpcoming({ content, status, fetchUpcoming = fetchUpcomingActivities }) {
  const scope = createRequestScope();
  const region = createRegionState({ content, status, skeletonCount: 3, loadingLabel: LOADING_MESSAGE });

  async function load() {
    region.showLoading({ announce: LOADING_MESSAGE });
    let cards;
    try {
      cards = toCards(await fetchUpcoming({ scope }));
    } catch (error) {
      if (isCancelled(error)) return;
      region.showError(error instanceof ApiError ? error : new ApiError("invalid_response", { cause: error }), {
        onRetry: load,
      });
      return;
    }

    if (cards.length === 0) {
      region.showEmpty({ message: EMPTY_MESSAGE, hint: EMPTY_HINT });
      return;
    }
    region.showSuccess(cards, { announce: loadedMessage(cards.length) });
  }

  return {
    load,
    destroy() {
      scope.cancel();
      region.destroy();
    },
  };
}
